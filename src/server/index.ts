import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { WebSocketServer } from 'ws';
import * as QRCode from 'qrcode';
import { LcuBridge } from '../lcu-bridge/client';
import { SessionManager } from './session';
import { getSuggestions } from './suggestions';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const bridge = new LcuBridge();
const sessions = new SessionManager();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const token = req.headers['x-session-token'] as string | undefined;
  if (!token || !sessions.validateSession(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

app.get('/api/health', (_req, res) => {
  const state = bridge.currentState;
  res.json({ status: 'ok', connected: state.connected, phase: state.phase, timestamp: Date.now() });
});

app.get('/api/session/qr', async (_req, res) => {
  const pending = sessions.createPendingToken();
  const baseUrl = sessions.getServerUrl(PORT);
  const authUrl = `${baseUrl}?token=${pending.token}`;
  const qrSvg = await QRCode.toString(authUrl, { type: 'svg', margin: 2, width: 300 });
  res.json({ url: authUrl, qrSvg, token: pending.token, expiresAt: pending.expiresAt });
});

app.post('/api/session/verify', (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) {
    res.status(400).json({ error: 'Token required' });
    return;
  }
  const session = sessions.verifyPendingToken(token);
  if (!session) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
  res.json({ sessionToken: session.token });
});

app.get('/api/summoner', authMiddleware, (_req, res) => {
  const state = bridge.currentState;
  if (!state.summoner) {
    res.status(503).json({ error: 'Not connected to League Client' });
    return;
  }
  res.json(state.summoner);
});

app.get('/api/gameflow/phase', authMiddleware, (_req, res) => {
  res.json({ phase: bridge.currentState.phase });
});

app.get('/api/champ-select/session', authMiddleware, async (_req, res) => {
  if (!bridge.currentState.connected) {
    res.status(503).json({ error: 'Not connected to League Client' });
    return;
  }
  try {
    const session = await bridge.makeRequest('GET', '/lol-champ-select/v1/session');
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch champ select session', details: (err as Error).message });
  }
});

app.post('/api/matchmaking/accept', authMiddleware, async (_req, res) => {
  if (!bridge.currentState.connected) {
    res.status(503).json({ error: 'Not connected to League Client' });
    return;
  }
  try {
    await bridge.makeRequest('POST', '/lol-matchmaking/v1/ready-check/accept');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept match', details: (err as Error).message });
  }
});

app.patch('/api/champ-select/my-selection', authMiddleware, async (req, res) => {
  if (!bridge.currentState.connected) {
    res.status(503).json({ error: 'Not connected to League Client' });
    return;
  }
  try {
    const result = await bridge.makeRequest('PATCH', '/lol-champ-select/v1/session/my-selection', req.body);
    res.json(result || { success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update selection', details: (err as Error).message });
  }
});

app.post('/api/champ-select/action/:id/complete', authMiddleware, async (req, res) => {
  if (!bridge.currentState.connected) {
    res.status(503).json({ error: 'Not connected to League Client' });
    return;
  }
  try {
    await bridge.makeRequest('POST', `/lol-champ-select/v1/session/actions/${req.params.id}/complete`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete action', details: (err as Error).message });
  }
});

let championsCache: Record<string, { id: string; name: string; image: string }> | null = null;

let perksCache: Record<string, unknown> | null = null;

app.get('/api/perks/data', async (_req, res) => {
  if (perksCache) {
    res.json(perksCache);
    return;
  }
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.10.1/data/en_US/runesReforged.json');
    perksCache = (await response.json()) as Record<string, unknown>;
    res.json(perksCache);
  } catch {
    res.status(500).json({ error: 'Failed to fetch perk data' });
  }
});

app.get('/api/perks/pages', authMiddleware, async (_req, res) => {
  if (!bridge.currentState.connected) {
    res.status(503).json({ error: 'Not connected to League Client' });
    return;
  }
  try {
    const pages = await bridge.makeRequest('GET', '/lol-perks/v1/pages');
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch perk pages', details: (err as Error).message });
  }
});

app.post('/api/perks/pages', authMiddleware, async (req, res) => {
  if (!bridge.currentState.connected) {
    res.status(503).json({ error: 'Not connected to League Client' });
    return;
  }
  try {
    const result = await bridge.makeRequest('POST', '/lol-perks/v1/pages', req.body);
    res.json(result || { success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create perk page', details: (err as Error).message });
  }
});

app.put('/api/perks/currentpage', authMiddleware, async (req, res) => {
  if (!bridge.currentState.connected) {
    res.status(503).json({ error: 'Not connected to League Client' });
    return;
  }
  try {
    const { id } = req.body as { id: number };
    const result = await bridge.makeRequest('PUT', `/lol-perks/v1/currentpage/${id}`);
    res.json(result || { success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set current perk page', details: (err as Error).message });
  }
});

async function ensureChampionsCache(): Promise<void> {
  if (championsCache) return;
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.10.1/data/en_US/champion.json');
    const data = (await response.json()) as { data: Record<string, { key: string; name: string; image: { full: string } }> };
    championsCache = {};
    for (const champ of Object.values(data.data)) {
      championsCache[champ.key] = { id: champ.key, name: champ.name, image: champ.image.full };
    }
  } catch {
    // cache will remain null
  }
}

app.get('/api/champions/suggestions', authMiddleware, async (_req, res) => {
  await ensureChampionsCache();
  if (!championsCache) {
    res.status(500).json({ error: 'Failed to load champion data' });
    return;
  }
  if (!bridge.currentState.connected) {
    res.status(503).json({ error: 'Not connected to League Client' });
    return;
  }
  try {
    const suggestions = await getSuggestions(
      (method, url, body) => bridge.makeRequest(method, url, body),
      championsCache,
    );
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate suggestions', details: (err as Error).message });
  }
});

app.get('/api/champions', async (_req, res) => {
  if (championsCache) {
    res.json(championsCache);
    return;
  }
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.10.1/data/en_US/champion.json');
    const data = (await response.json()) as { data: Record<string, { key: string; name: string; image: { full: string } }> };
    championsCache = {};
    for (const champ of Object.values(data.data)) {
      championsCache[champ.key] = { id: champ.key, name: champ.name, image: champ.image.full };
    }
    res.json(championsCache);
  } catch {
    res.status(500).json({ error: 'Failed to fetch champion data' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

bridge.on('connected', (summoner) => {
  console.log(`[Server] Bridge connected: ${summoner.displayName}`);
  broadcast({ type: 'bridge:connected', summoner });
});

bridge.on('disconnected', () => {
  console.log('[Server] Bridge disconnected');
  broadcast({ type: 'bridge:disconnected' });
});

bridge.on('phaseChanged', (phase) => {
  broadcast({ type: 'gameflow:phase', phase });
});

bridge.on('champSelectChanged', (data) => {
  broadcast({ type: 'champ-select:update', data });
});

bridge.on('error', (err) => {
  console.error('[Server] Bridge error:', err.message);
});

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '/', 'http://localhost');
  const token = url.searchParams.get('session');

  if (!token || !sessions.validateSession(token)) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  const state = bridge.currentState;
  ws.send(JSON.stringify({ type: 'bridge:state', state }));

  ws.on('close', () => {
    console.log('[Server] Client disconnected from WebSocket');
  });
});

function broadcast(data: Record<string, unknown>): void {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

server.listen(PORT, () => {
  console.log(`LeagueHelper server running on http://localhost:${PORT}`);
  bridge.start();
});
