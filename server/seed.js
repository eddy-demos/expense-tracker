import db, { DEFAULT_CATEGORIES, PAYMENT_METHODS } from './db.js';

const count = db.prepare('SELECT COUNT(*) AS c FROM expenses').get().c;
if (count > 0) {
  console.log(`Database already has ${count} expenses. Skipping seed.`);
  process.exit(0);
}

const samples = [
  { amount: 12.50, category: 'Food', daysAgo: 0, description: 'Lunch burrito', payment_method: 'debit' },
  { amount: 45.00, category: 'Transport', daysAgo: 1, description: 'Uber ride', payment_method: 'credit' },
  { amount: 1200.00, category: 'Housing', daysAgo: 3, description: 'Rent share', payment_method: 'bank_transfer' },
  { amount: 78.32, category: 'Utilities', daysAgo: 5, description: 'Electricity bill', payment_method: 'bank_transfer' },
  { amount: 22.99, category: 'Entertainment', daysAgo: 7, description: 'Movie tickets', payment_method: 'credit' },
  { amount: 65.40, category: 'Health', daysAgo: 10, description: 'Pharmacy', payment_method: 'debit' },
  { amount: 134.20, category: 'Shopping', daysAgo: 14, description: 'New running shoes', payment_method: 'credit' },
  { amount: 9.99, category: 'Entertainment', daysAgo: 18, description: 'Streaming subscription', payment_method: 'credit' },
  { amount: 56.75, category: 'Food', daysAgo: 22, description: 'Grocery run', payment_method: 'debit' },
  { amount: 28.00, category: 'Other', daysAgo: 27, description: 'Birthday card + gift', payment_method: 'cash' }
];

const insert = db.prepare(
  'INSERT INTO expenses (amount, category, date, description, payment_method) VALUES (?, ?, ?, ?, ?)'
);

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const tx = db.transaction((rows) => {
  for (const r of rows) {
    insert.run(r.amount, r.category, isoDaysAgo(r.daysAgo), r.description, r.payment_method);
  }
});
tx(samples);

console.log(`Seeded ${samples.length} expenses.`);
