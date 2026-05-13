import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'expenses.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'debit', 'credit', 'bank_transfer', 'other')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;

export const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Utilities',
  'Entertainment', 'Health', 'Shopping', 'Other'
];

export const PAYMENT_METHODS = ['cash', 'debit', 'credit', 'bank_transfer', 'other'];
