import path from 'path';
import fs from 'fs';

let dbInstance: any = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'medischedule.db');

  let rawDb: any = null;
  let isBetterSqlite = false;

  // 1. Try better-sqlite3 first (compatible across Node 18, 20, 22, 24)
  try {
    const BetterSqlite3 = require('better-sqlite3');
    rawDb = new BetterSqlite3(dbPath);
    rawDb.pragma('journal_mode = WAL');
    rawDb.pragma('foreign_keys = ON');
    isBetterSqlite = true;
  } catch (_e1) {
    // 2. Fallback to node:sqlite (native in Node 22.5+) if available
    try {
      // @ts-ignore
      const { DatabaseSync } = require('node:sqlite');
      if (DatabaseSync) {
        rawDb = new DatabaseSync(dbPath);
        rawDb.exec('PRAGMA journal_mode = WAL;');
        rawDb.exec('PRAGMA foreign_keys = ON;');
        isBetterSqlite = false;
      }
    } catch (_e2) {
      console.warn('Warning: No SQLite driver available, using in-memory mock');
    }
  }

  if (!rawDb) {
    // Safe dummy fallback for static page data collection in environments without C++ addon
    return {
      prepare() {
        return {
          run() {
            return { changes: 0, lastInsertRowid: 0 };
          },
          get() {
            return undefined;
          },
          all() {
            return [];
          },
        };
      },
      exec() {},
      transaction(fn: Function) {
        return (...args: any[]) => fn(...args);
      },
    };
  }

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
      if (isBetterSqlite && typeof rawDb.transaction === 'function') {
        return rawDb.transaction(fn);
      }
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
  try {
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
  } catch (_) {}

  dbInstance = db;
  return dbInstance;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
