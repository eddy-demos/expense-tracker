import { useState, useEffect } from 'react';
import { api, fmtUSD, categoryColor, monthStartISO, monthEndISO } from '../api.js';

const STORAGE_KEY = 'budgets';

function loadBudgets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export default function Budgets() {
  const [budgets, setBudgets] = useState(loadBudgets);
  const [categories, setCategories] = useState([]);
  const [spent, setSpent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.categories(),
      api.summary({ start_date: monthStartISO(), end_date: monthEndISO() })
    ]).then(([cats, sum]) => {
      if (!active) return;
      setCategories(cats);
      const map = {};
      (sum.by_category || []).forEach(c => { map[c.category] = c.total; });
      setSpent(map);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function setBudget(cat, value) {
    const next = { ...budgets };
    const num = parseFloat(value);
    if (!value || isNaN(num) || num <= 0) {
      delete next[cat];
    } else {
      next[cat] = num;
    }
    setBudgets(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <div className="app">
      <h1>Budgets</h1>
      <p style={{ color: 'var(--muted)', marginTop: -12, marginBottom: 24 }}>
        Set a monthly limit per category. Progress reflects this month's spending.
      </p>

      {loading ? (
        <div className="section">Loading…</div>
      ) : (
        <div className="section">
          {categories.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No categories yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {categories.map(cat => {
                const limit = budgets[cat] || 0;
                const used = spent[cat] || 0;
                const pct = limit ? Math.min((used / limit) * 100, 100) : 0;
                const over = limit && used > limit;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{
                        display: 'inline-block', width: 10, height: 10, borderRadius: 3,
                        background: categoryColor(cat)
                      }} />
                      <strong style={{ flex: 1 }}>{cat}</strong>
                      <span style={{ fontSize: 13, color: over ? 'var(--danger)' : 'var(--muted)' }}>
                        {fmtUSD.format(used)}{limit ? ` / ${fmtUSD.format(limit)}` : ''}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        placeholder="Set limit"
                        value={budgets[cat] ?? ''}
                        onChange={e => setBudget(cat, e.target.value)}
                        style={{ width: 110 }}
                      />
                    </div>
                    {limit > 0 && (
                      <div style={{ height: 8, background: 'var(--bg)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: over ? 'var(--danger)' : categoryColor(cat),
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
