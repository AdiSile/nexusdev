import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// ── Tipuri pentru tabele ──────────────────────────────────────────────

export interface SettingRow {
  key: string;
  value: string; // JSON string
  updated_at: string; // ISO timestamp
}

export interface MessageRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string; // ISO timestamp
  read: 0 | 1;
}

export interface NewMessage {
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

// ── Inițializare bază de date ────────────────────────────────────────

const DB_DIR = path.resolve(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'nexusdev.db');

// Asigură existența directorului pentru baza de date
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// ── Configurare conexiune ────────────────────────────────────────────

// Activează WAL mode pentru performanță mai bună la citiri concurente
db.pragma('journal_mode = WAL');

// Activează foreign keys
db.pragma('foreign_keys = ON');

// Setează busy timeout la 5 secunde
db.pragma('busy_timeout = 5000');

// ── Creare tabele ────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY NOT NULL,
    value       TEXT NOT NULL DEFAULT '{}',
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    message     TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    read        INTEGER NOT NULL DEFAULT 0 CHECK (read IN (0, 1))
  );

  CREATE INDEX IF NOT EXISTS idx_messages_created_at
    ON messages (created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_messages_read
    ON messages (read);
`);

// ── Prepared Statements: Settings ────────────────────────────────────

const stmtGetAllSettings = db.prepare<[]>(
  `SELECT key, value, updated_at FROM settings ORDER BY key`
);

const stmtGetSetting = db.prepare<[string]>(
  `SELECT key, value, updated_at FROM settings WHERE key = ?`
);

const stmtUpsertSetting = db.prepare<[string, string, string]>(
  `INSERT INTO settings (key, value, updated_at)
   VALUES (?, ?, ?)
   ON CONFLICT (key) DO UPDATE SET
     value      = excluded.value,
     updated_at = excluded.updated_at`
);

const stmtDeleteSetting = db.prepare<[string]>(
  `DELETE FROM settings WHERE key = ?`
);

// ── Prepared Statements: Messages ────────────────────────────────────

const stmtInsertMessage = db.prepare<[string, string, string | null, string]>(
  `INSERT INTO messages (name, email, phone, message, created_at)
   VALUES (?, ?, ?, ?, datetime('now'))`
);

const stmtGetAllMessages = db.prepare<[]>(
  `SELECT id, name, email, phone, message, created_at, read
   FROM messages
   ORDER BY created_at DESC`
);

const stmtGetUnreadMessages = db.prepare<[]>(
  `SELECT id, name, email, phone, message, created_at, read
   FROM messages
   WHERE read = 0
   ORDER BY created_at DESC`
);

const stmtGetMessageById = db.prepare<[number]>(
  `SELECT id, name, email, phone, message, created_at, read
   FROM messages
   WHERE id = ?`
);

const stmtMarkMessageRead = db.prepare<[number]>(
  `UPDATE messages SET read = 1 WHERE id = ?`
);

const stmtDeleteMessage = db.prepare<[number]>(
  `DELETE FROM messages WHERE id = ?`
);

// ── Funcții publice: Settings ────────────────────────────────────────

export function getAllSettings(): SettingRow[] {
  return stmtGetAllSettings.all() as SettingRow[];
}

export function getSetting(key: string): SettingRow | undefined {
  return stmtGetSetting.get(key) as SettingRow | undefined;
}

export function upsertSetting(key: string, value: unknown): SettingRow {
  const now = new Date().toISOString();
  const valueJson = typeof value === 'string' ? value : JSON.stringify(value);

  stmtUpsertSetting.run(key, valueJson, now);

  return {
    key,
    value: valueJson,
    updated_at: now,
  };
}

export function deleteSetting(key: string): boolean {
  const result = stmtDeleteSetting.run(key);
  return result.changes > 0;
}

// ── Funcții publice: Messages ────────────────────────────────────────

export function insertMessage(msg: NewMessage): MessageRow {
  const result = stmtInsertMessage.run(
    msg.name,
    msg.email,
    msg.phone ?? null,
    msg.message
  );

  const row = stmtGetMessageById.get(result.lastInsertRowid as number) as MessageRow;
  return row;
}

export function getAllMessages(): MessageRow[] {
  return stmtGetAllMessages.all() as MessageRow[];
}

export function getUnreadMessages(): MessageRow[] {
  return stmtGetUnreadMessages.all() as MessageRow[];
}

export function getMessageById(id: number): MessageRow | undefined {
  return stmtGetMessageById.get(id) as MessageRow | undefined;
}

export function markMessageRead(id: number): boolean {
  const result = stmtMarkMessageRead.run(id);
  return result.changes > 0;
}

export function deleteMessage(id: number): boolean {
  const result = stmtDeleteMessage.run(id);
  return result.changes > 0;
}

// ── Cleanup ──────────────────────────────────────────────────────────

export function closeDatabase(): void {
  db.close();
}

// Închidere grațioasă la terminarea procesului
process.on('exit', () => {
  try {
    db.close();
  } catch {
    // baza poate fi deja închisă
  }
});

process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

export default db;