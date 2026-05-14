import { randomUUID } from 'crypto';
import { networkInterfaces } from 'os';

const TOKEN_EXPIRY_MS = 5 * 60 * 1000;
const SESSION_EXPIRY_MS = 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

interface PendingToken {
  token: string;
  expiresAt: number;
  used: boolean;
}

interface Session {
  id: string;
  token: string;
  createdAt: number;
  lastSeen: number;
}

export class SessionManager {
  private pendingTokens = new Map<string, PendingToken>();
  private sessions = new Map<string, Session>();
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupTimer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL_MS);
  }

  getLocalIp(): string {
    const interfaces = networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const nets = interfaces[name];
      if (!nets) continue;
      for (const net of nets) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return '127.0.0.1';
  }

  getServerUrl(port: number): string {
    const ip = this.getLocalIp();
    return `http://${ip}:${port}`;
  }

  createPendingToken(): PendingToken {
    this.cleanup();
    const token = randomUUID();
    const entry: PendingToken = {
      token,
      expiresAt: Date.now() + TOKEN_EXPIRY_MS,
      used: false,
    };
    this.pendingTokens.set(token, entry);
    return entry;
  }

  verifyPendingToken(token: string): Session | null {
    const entry = this.pendingTokens.get(token);
    if (!entry) return null;
    if (entry.used) return null;
    if (Date.now() > entry.expiresAt) {
      this.pendingTokens.delete(token);
      return null;
    }
    entry.used = true;
    const session: Session = {
      id: randomUUID(),
      token: randomUUID(),
      createdAt: Date.now(),
      lastSeen: Date.now(),
    };
    this.sessions.set(session.token, session);
    return session;
  }

  validateSession(sessionToken: string): boolean {
    const session = this.sessions.get(sessionToken);
    if (!session) return false;
    if (Date.now() - session.lastSeen > SESSION_EXPIRY_MS) {
      this.sessions.delete(sessionToken);
      return false;
    }
    session.lastSeen = Date.now();
    return true;
  }

  removeSession(sessionToken: string): void {
    this.sessions.delete(sessionToken);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [token, entry] of this.pendingTokens) {
      if (now > entry.expiresAt) {
        this.pendingTokens.delete(token);
      }
    }
    for (const [token, session] of this.sessions) {
      if (now - session.lastSeen > SESSION_EXPIRY_MS) {
        this.sessions.delete(token);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupTimer);
    this.pendingTokens.clear();
    this.sessions.clear();
  }
}
