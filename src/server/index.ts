import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    console.log('received:', data.toString());
  });
  ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to LeagueHelper' }));
});

server.listen(PORT, () => {
  console.log(`LeagueHelper server running on http://localhost:${PORT}`);
});
