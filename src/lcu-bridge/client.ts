import { EventEmitter } from 'events';
import {
  authenticate,
  LeagueClient,
  createWebSocketConnection,
  createHttp1Request,
  type Credentials,
  type LeagueWebSocket,
} from 'league-connect';
import type { GameflowPhase, Summoner } from '../shared/types';
import type { BridgeState } from './types';

const PHASES: GameflowPhase[] = [
  'None', 'Lobby', 'Matchmaking', 'ReadyCheck', 'ChampSelect',
  'GameStart', 'InProgress', 'Reconnect', 'PreEndOfGame',
  'EndOfGame', 'WaitingForStats',
];

export class LcuBridge extends EventEmitter {
  private state: BridgeState = {
    connected: false,
    summoner: null,
    phase: 'None',
    credentials: null,
  };

  private leagueClient: LeagueClient | null = null;
  private ws: LeagueWebSocket | null = null;
  private destroyed = false;

  constructor() {
    super();
  }

  get currentState(): BridgeState {
    return { ...this.state };
  }

  async start(): Promise<void> {
    console.log('[LCU Bridge] Starting...');
    this.destroyed = false;
    this.watchClient();
  }

  private watchClient(): void {
    authenticate({ awaitConnection: true, pollInterval: 2500 })
      .then((credentials) => {
        console.log('[LCU Bridge] League Client detected');
        this.onClientConnected(credentials);
      })
      .catch((err) => {
        if (!this.destroyed) {
          console.error('[LCU Bridge] Authentication error:', err.message);
          this.emit('error', err);
          setTimeout(() => this.watchClient(), 5000);
        }
      });
  }

  private async onClientConnected(credentials: Credentials): Promise<void> {
    try {
      this.state.credentials = credentials;

      this.leagueClient = new LeagueClient(credentials, { pollInterval: 2500 });
      this.leagueClient.on('disconnect', () => {
        console.log('[LCU Bridge] League Client disconnected');
        this.onClientDisconnected();
      });
      this.leagueClient.start();

      const summoner = await this.fetchSummoner();
      this.state.summoner = summoner;
      this.state.connected = true;

      console.log(`[LCU Bridge] Connected as: ${summoner.displayName} (Level ${summoner.summonerLevel})`);
      this.emit('connected', summoner);

      await this.connectWebSocket(credentials);
      await this.fetchInitialPhase();
    } catch (err) {
      console.error('[LCU Bridge] Connection setup error:', (err as Error).message);
      this.emit('error', err as Error);
    }
  }

  private onClientDisconnected(): void {
    this.state.connected = false;
    this.state.summoner = null;
    this.state.phase = 'None';
    this.state.credentials = null;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.emit('disconnected');

    if (!this.destroyed) {
      console.log('[LCU Bridge] Waiting for League Client to return...');
      this.watchClient();
    }
  }

  private async connectWebSocket(credentials: Credentials): Promise<void> {
    this.ws = await createWebSocketConnection({
      authenticationOptions: { ...credentials, awaitConnection: true },
      pollInterval: 1000,
    });

    this.ws.on('close', () => {
      console.log('[LCU Bridge] WebSocket closed');
    });

    this.ws.on('error', (err) => {
      console.error('[LCU Bridge] WebSocket error:', err.message);
    });

    this.ws.subscribe<string>(
      '/lol-gameflow/v1/gameflow-phase',
      (data) => {
        const phase = (data as GameflowPhase) ?? 'None';
        if (phase !== this.state.phase) {
          this.state.phase = phase;
          console.log(`[LCU Bridge] Phase changed: ${phase}`);
          this.emit('phaseChanged', phase);
        }
      },
    );

    this.ws.subscribe(
      '/lol-champ-select/v1/session',
      (data) => {
        this.emit('champSelectChanged', data);
      },
    );

    console.log('[LCU Bridge] WebSocket connected and subscribed');
  }

  private async fetchSummoner(): Promise<Summoner> {
    const res = await createHttp1Request(
      { method: 'GET', url: '/lol-summoner/v1/current-summoner' },
      this.state.credentials!,
    );
    return JSON.parse(res.text()) as Summoner;
  }

  private async fetchInitialPhase(): Promise<void> {
    try {
      const res = await createHttp1Request(
        { method: 'GET', url: '/lol-gameflow/v1/gameflow-phase' },
        this.state.credentials!,
      );
      const phase = JSON.parse(res.text()) as string;
      if (PHASES.includes(phase as GameflowPhase)) {
        this.state.phase = phase as GameflowPhase;
        console.log(`[LCU Bridge] Initial phase: ${phase}`);
      }
    } catch (err) {
      console.warn('[LCU Bridge] Could not fetch initial phase:', (err as Error).message);
    }
  }

  async makeRequest<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    body?: unknown,
  ): Promise<T> {
    if (!this.state.credentials) {
      throw new Error('LCU Bridge not connected');
    }
    const res = await createHttp1Request(
      { method, url, body: body as Record<string, unknown> | undefined },
      this.state.credentials,
    );
    const text = res.text();
    if (res.status >= 400) {
      const detail = text ? `: ${text}` : '';
      throw new Error(`LCU request failed ${method} ${url} (${res.status})${detail}`);
    }
    return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
  }

  stop(): void {
    this.destroyed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.leagueClient) {
      this.leagueClient.stop();
      this.leagueClient = null;
    }
    this.state.connected = false;
    console.log('[LCU Bridge] Stopped');
  }
}
