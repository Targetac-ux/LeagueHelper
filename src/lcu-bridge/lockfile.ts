import { readFileSync, existsSync } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';

const LOCKFILE_NAME = 'lockfile';
const LEAGUE_CLIENT_DIR = 'League Client';
const RIOT_GAMES_DIR = 'Riot Games';

export interface LockfileData {
  name: string;
  pid: number;
  port: number;
  password: string;
  protocol: string;
}

export function getDefaultLockfilePath(): string {
  const root = platform() === 'win32' ? process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local') : join(homedir(), '.local', 'share');
  return join(root, RIOT_GAMES_DIR, LEAGUE_CLIENT_DIR, LOCKFILE_NAME);
}

export function parseLockfile(content: string): LockfileData {
  const parts = content.trim().split(':');
  if (parts.length !== 5) {
    throw new Error(`Invalid lockfile format: expected 5 parts, got ${parts.length}`);
  }
  return {
    name: parts[0],
    pid: parseInt(parts[1], 10),
    port: parseInt(parts[2], 10),
    password: parts[3],
    protocol: parts[4],
  };
}

export function readLockfile(path?: string): LockfileData {
  const filePath = path || getDefaultLockfilePath();
  if (!existsSync(filePath)) {
    throw new Error(`Lockfile not found at: ${filePath}`);
  }
  const content = readFileSync(filePath, 'utf-8');
  return parseLockfile(content);
}
