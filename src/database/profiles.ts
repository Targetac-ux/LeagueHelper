import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

export interface Profile {
  id: number;
  name: string;
  preferredChampionIds: number[];
  runePageId: number | null;
  autoMode: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Row {
  id: number;
  name: string;
  preferred_champion_ids: string;
  rune_page_id: number | null;
  auto_mode: number;
  created_at: string;
  updated_at: string;
}

const DB_PATH = join(__dirname, '..', '..', 'data', 'leaguehelper.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    const dir = join(__dirname, '..', '..', 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        preferred_champion_ids TEXT NOT NULL DEFAULT '[]',
        rune_page_id INTEGER,
        auto_mode INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }
  return db;
}

function rowToProfile(row: Row): Profile {
  return {
    id: row.id,
    name: row.name,
    preferredChampionIds: JSON.parse(row.preferred_champion_ids) as number[],
    runePageId: row.rune_page_id,
    autoMode: row.auto_mode === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllProfiles(): Profile[] {
  const rows = getDb().prepare('SELECT * FROM profiles ORDER BY id').all() as Row[];
  return rows.map(rowToProfile);
}

export function getProfile(id: number): Profile | null {
  const row = getDb().prepare('SELECT * FROM profiles WHERE id = ?').get(id) as Row | undefined;
  return row ? rowToProfile(row) : null;
}

export function createProfile(name: string): Profile {
  const result = getDb().prepare('INSERT INTO profiles (name) VALUES (?)').run(name);
  return getProfile(result.lastInsertRowid as number)!;
}

export function updateProfile(id: number, data: { name?: string; preferredChampionIds?: number[]; runePageId?: number | null; autoMode?: boolean }): Profile | null {
  const existing = getProfile(id);
  if (!existing) return null;
  const name = data.name ?? existing.name;
  const ids = data.preferredChampionIds ?? existing.preferredChampionIds;
  const runePageId = data.runePageId !== undefined ? data.runePageId : existing.runePageId;
  const autoMode = data.autoMode !== undefined ? data.autoMode : existing.autoMode;
  getDb().prepare(`
    UPDATE profiles SET name = ?, preferred_champion_ids = ?, rune_page_id = ?, auto_mode = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(name, JSON.stringify(ids), runePageId, autoMode ? 1 : 0, id);
  return getProfile(id);
}

export function deleteProfile(id: number): boolean {
  const result = getDb().prepare('DELETE FROM profiles WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getActiveProfileId(): number | null {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'active_profile_id'").get() as { value: string } | undefined;
  const id = row ? parseInt(row.value, 10) : null;
  if (id !== null && getProfile(id)) return id;
  return null;
}

export function setActiveProfileId(id: number | null): void {
  if (id === null) {
    getDb().prepare("DELETE FROM settings WHERE key = 'active_profile_id'").run();
  } else {
    getDb().prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('active_profile_id', ?)").run(String(id));
  }
}
