import path from 'path';
import fs from 'fs';

// Node.js native SQLite (available in Node 22+)
// Dynamically require to avoid TypeScript definition conflicts on older @types/node
// @ts-ignore
const { DatabaseSync } = typeof require !== 'undefined' ? require('node:sqlite') : {};

let dbInstance: any = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'medischedule.db');
  const rawDb = new DatabaseSync(dbPath);
  rawDb.exec('PRAGMA journal_mode = WAL;');
  rawDb.exec('PRAGMA foreign_keys = ON;');

  // High-performance Node.js native wrapper returning standard plain objects
  // (Prevents Next.js Server-to-Client component null prototype serialization errors)
  const db = {
    prepare(sql: string) {
      const stmt = rawDb.prepare(sql);
      return {
        run(...params: any[]) {
          return stmt.run(...params);
        },
        get(...params: any[]) {
          const row = stmt.get(...params);
          return row ? { ...row } : undefined;
        },
        all(...params: any[]) {
          const rows = stmt.all(...params);
          return rows ? rows.map((r: any) => ({ ...r })) : [];
        },
      };
    },
    exec(sql: string) {
      return rawDb.exec(sql);
    },
    transaction(fn: Function) {
      return (...args: any[]) => {
        rawDb.exec('BEGIN');
        try {
          const res = fn(...args);
          rawDb.exec('COMMIT');
          return res;
        } catch (err) {
          rawDb.exec('ROLLBACK');
          throw err;
        }
      };
    },
  };

  // Auto-run migration if tables are missing
  const tableCheck = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tenants'")
    .get();

  if (!tableCheck) {
    const migrationPath = path.join(process.cwd(), 'migrations', '0001_initial_schema.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      db.exec(sql);
    }
  }

  dbInstance = db;
  return dbInstance;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
