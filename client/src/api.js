const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  listExpenses: (params) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v) qs.set(k, v); });
    return request(`/expenses?${qs.toString()}`);
  },
  getExpense: (id) => request(`/expenses/${id}`),
  createExpense: (body) => request('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  updateExpense: (id, body) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  summary: (params) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v) qs.set(k, v); });
    return request(`/summary?${qs.toString()}`);
  },
  trends: (params) => {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v) qs.set(k, v); });
    const q = qs.toString();
    return request(`/trends${q ? `?${q}` : ''}`);
  },
  categories: () => request('/categories'),
  budgets: () => request('/budgets'),
  setBudget: (category, monthly_limit) =>
    request(`/budgets/${encodeURIComponent(category)}`, {
      method: 'PUT',
      body: JSON.stringify({ monthly_limit })
    }),
  deleteBudget: (category) =>
    request(`/budgets/${encodeURIComponent(category)}`, { method: 'DELETE' })
};

export const fmtUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthStartISO(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  return x.toISOString().slice(0, 10);
}

export function monthEndISO(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return x.toISOString().slice(0, 10);
}

export function weekStartISO(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x.toISOString().slice(0, 10);
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Formats a 'YYYY-MM' key into e.g. 'Jun 2026'.
export function monthLabel(ym) {
  if (!ym || ym.length < 7) return ym || '';
  const [y, m] = ym.split('-');
  const idx = Number(m) - 1;
  return `${MONTH_NAMES[idx] || m} ${y}`;
}

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' }
];

export function paymentLabel(v) {
  return PAYMENT_METHODS.find(p => p.value === v)?.label || v;
}

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Housing: '#8b5cf6',
  Utilities: '#10b981',
  Entertainment: '#ec4899',
  Health: '#ef4444',
  Shopping: '#06b6d4',
  Other: '#6b7280'
};

export function categoryColor(name) {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h}, 65%, 50%)`;
}
