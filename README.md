# Expense Tracker

A small CRUD web app for tracking personal expenses.

- **Frontend:** React + Vite (JavaScript, plain CSS modules)
- **Backend:** Express
- **Database:** SQLite (better-sqlite3)
- **Layout:** npm workspaces monorepo — `/server` and `/client`

## Setup

```bash
npm install          # installs both workspaces
npm run seed         # seeds 10 sample expenses (skips if data exists)
npm run dev          # runs API on :3001 and Vite on :5173
```

Open http://localhost:5173. Vite proxies `/api` to the Express server.

## Scripts

| Command                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | Runs server + client concurrently            |
| `npm run seed`          | Seeds the SQLite DB with 10 example expenses |
| `npm run dev -w server` | Server only                                  |
| `npm run dev -w client` | Client only                                  |

The SQLite file lives at `server/expenses.db` (gitignored).

## API

Base URL: `/api`

| Method | Path            | Description                                                                                                            |
| ------ | --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| GET    | `/expenses`     | List. Query: `category`, `start_date`, `end_date`, `sort` (`date_desc` \| `date_asc` \| `amount_desc` \| `amount_asc`) |
| GET    | `/expenses/:id` | Single record or 404                                                                                                   |
| POST   | `/expenses`     | Create from JSON. Returns 201                                                                                          |
| PUT    | `/expenses/:id` | Update. Returns record or 404                                                                                          |
| DELETE | `/expenses/:id` | Returns 204 or 404                                                                                                     |
| GET    | `/summary`      | Query: `start_date`, `end_date`. Returns `{ total, by_category, by_payment_method }`                                   |
| GET    | `/categories`   | Distinct categories (default list merged with any user-added ones)                                                     |

### Expense shape

```json
{
  "id": 1,
  "amount": 12.50,
  "category": "Food",
  "date": "2026-05-13",
  "description": "Lunch",
  "payment_method": "debit",
  "created_at": "2026-05-13 17:10:05"
}
```

`payment_method` must be one of: `cash`, `debit`, `credit`, `bank_transfer`, `other`.

Validation errors return `400 { "error": "..." }`.

## Notes

- Money is stored as `REAL` server-side and formatted with `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` on the client to avoid floating-point display issues.
- The UI filter state is synced to the URL query string for shareability — no router required.
- Categories are stored as free text; the dropdown is just a convenience.
