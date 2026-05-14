import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { LcuBridge } from '../lcu-bridge/client';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const bridge = new LcuBridge();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const state = bridge.currentState;
  res.json({ status: 'ok', connected: state.connected, phase: state.phase, timestamp: Date.now() });
});

app.get('/api/summoner', (_req, res) => {
  const state = bridge.currentState;
  if (!state.summoner) {
    res.status(503).json({ error: 'Not connected to League Client' });
    return;
  }
  res.json(state.summoner);
});

app.get('/api/gameflow/phase', (_req, res) => {
  res.json({ phase: bridge.currentState.phase });
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

bridge.on('error', (err) => {
  console.error('[Server] Bridge error:', err.message);
});

wss.on('connection', (ws) => {
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
