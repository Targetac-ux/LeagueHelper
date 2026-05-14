import type { Credentials } from 'league-connect';
import type { GameflowPhase, Summoner } from '../shared/types';

export interface BridgeState {
  connected: boolean;
  summoner: Summoner | null;
  phase: GameflowPhase;
  credentials: Credentials | null;
}

export type BridgeEvent = 'connected' | 'disconnected' | 'phaseChanged' | 'error';
