import express from 'express';
import cors from 'cors';
import db, { DEFAULT_CATEGORIES, PAYMENT_METHODS } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function validateExpense(body) {
  const errors = [];
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) errors.push('amount must be a positive number');
  if (!body.category || typeof body.category !== 'string' || !body.category.trim()) errors.push('category is required');
  if (!body.date || !ISO_DATE.test(body.date)) errors.push('date must be YYYY-MM-DD');
  if (!body.description || typeof body.description !== 'string' || !body.description.trim()) errors.push('description is required');
  if (!PAYMENT_METHODS.includes(body.payment_method)) errors.push(`payment_method must be one of ${PAYMENT_METHODS.join(', ')}`);
  return {
    errors,
    value: errors.length ? null : {
      amount,
      category: body.category.trim(),
      date: body.date,
      description: body.description.trim(),
      payment_method: body.payment_method
    }
  };
}

app.get('/api/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM expenses ORDER BY category').all();
  const fromDb = rows.map(r => r.category);
  const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...fromDb]));
  res.json(merged);
});

app.get('/api/expenses', (req, res) => {
  const { category, start_date, end_date, sort } = req.query;
  const where = [];
  const params = {};
  if (category) { where.push('category = @category'); params.category = category; }
  if (start_date && ISO_DATE.test(start_date)) { where.push('date >= @start_date'); params.start_date = start_date; }
  if (end_date && ISO_DATE.test(end_date)) { where.push('date <= @end_date'); params.end_date = end_date; }

  const orderMap = {
    date_desc: 'date DESC, id DESC',
    date_asc: 'date ASC, id ASC',
    amount_desc: 'amount DESC, id DESC',
    amount_asc: 'amount ASC, id ASC'
  };
  const orderBy = orderMap[sort] || orderMap.date_desc;

  const sql = `SELECT * FROM expenses ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${orderBy}`;
  const rows = db.prepare(sql).all(params);
  res.json(rows);
});

app.get('/api/summary', (req, res) => {
  const { start_date, end_date } = req.query;
  const where = [];
  const params = {};
  if (start_date && ISO_DATE.test(start_date)) { where.push('date >= @start_date'); params.start_date = start_date; }
  if (end_date && ISO_DATE.test(end_date)) { where.push('date <= @end_date'); params.end_date = end_date; }
  const w = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const total = db.prepare(`SELECT COALESCE(SUM(amount), 0) AS total FROM expenses ${w}`).get(params).total;
  const by_category = db.prepare(
    `SELECT category, SUM(amount) AS total, COUNT(*) AS count FROM expenses ${w} GROUP BY category ORDER BY total DESC`
  ).all(params);
  const by_payment_method = db.prepare(
    `SELECT payment_method AS method, SUM(amount) AS total, COUNT(*) AS count FROM expenses ${w} GROUP BY payment_method ORDER BY total DESC`
  ).all(params);

  res.json({ total, by_category, by_payment_method });
});

app.get('/api/expenses/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

app.post('/api/expenses', (req, res) => {
  const { errors, value } = validateExpense(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });
  const info = db.prepare(
    'INSERT INTO expenses (amount, category, date, description, payment_method) VALUES (@amount, @category, @date, @description, @payment_method)'
  ).run(value);
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.put('/api/expenses/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { errors, value } = validateExpense(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });
  db.prepare(
    'UPDATE expenses SET amount=@amount, category=@category, date=@date, description=@description, payment_method=@payment_method WHERE id=@id'
  ).run({ ...value, id: Number(req.params.id) });
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  res.json(row);
});

app.delete('/api/expenses/:id', (req, res) => {
  const info = db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
