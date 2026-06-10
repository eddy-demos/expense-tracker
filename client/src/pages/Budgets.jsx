import { useState, useEffect, useCallback } from 'react';
import { api, fmtUSD, categoryColor, monthStartISO, monthEndISO } from '../api.js';
import s from './pages.module.css';

export default function Budgets() {
  const [categories, setCategories] = useState([]);
  const [spendByCat, setSpendByCat] = useState({});
  const [limits, setLimits] = useState({});   // category -> number
  const [drafts, setDrafts] = useState({});    // category -> string (input value)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingCat, setSavingCat] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, budgets, summary] = await Promise.all([
        api.categories(),
        api.budgets(),
        api.summary({ start_date: monthStartISO(), end_date: monthEndISO() })
      ]);
      const spend = {};
      (summary.by_category || []).forEach((c) => { spend[c.category] = c.total; });
      const lim = {};
      const dft = {};
      budgets.forEach((b) => { lim[b.category] = b.monthly_limit; dft[b.category] = String(b.monthly_limit); });
      setCategories(cats);
      setSpendByCat(spend);
      setLimits(lim);
      setDrafts(dft);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function commit(category) {
    const raw = (drafts[category] ?? '').trim();
    const current = limits[category];

    // Empty input clears the budget.
    if (raw === '') {
      if (current === undefined) return;
      setSavingCat(category);
      try {
        await api.deleteBudget(category);
        setLimits((p) => { const n = { ...p }; delete n[category]; return n; });
      } catch (e) { setError(e.message); }
      finally { setSavingCat(null); }
      return;
    }

    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      setDrafts((p) => ({ ...p, [category]: current !== undefined ? String(current) : '' }));
      return;
    }
    if (value === current) return;

    setSavingCat(category);
    try {
      await api.setBudget(category, value);
      setLimits((p) => ({ ...p, [category]: value }));
    } catch (e) { setError(e.message); }
    finally { setSavingCat(null); }
  }

  const totalBudget = Object.values(limits).reduce((a, b) => a + b, 0);
  const totalSpent = categories.reduce((a, c) => a + (spendByCat[c] || 0), 0);
  const remaining = totalBudget - totalSpent;

  return (
    <>
      <h1 className="pageTitle">Budgets</h1>
      <p className="pageSubtitle">Set a monthly spending limit per category. Progress reflects this month's spending.</p>

      {error && <div className="section" style={{ color: 'var(--danger)' }}>Error: {error}</div>}

      <div className={s.statGrid}>
        <Stat label="Total budget" value={fmtUSD.format(totalBudget)} sub="across categories" />
        <Stat label="Spent this month" value={fmtUSD.format(totalSpent)} />
        <Stat
          label="Remaining"
          value={fmtUSD.format(remaining)}
          over={remaining < 0}
          sub={remaining < 0 ? 'over budget' : 'left to spend'}
        />
      </div>

      <div className="section">
        <div className={s.sectionHead}>
          <h3 className={s.sectionTitle}>Category budgets</h3>
        </div>

        {loading ? (
          <p className={s.empty}>Loading…</p>
        ) : (
          categories.map((cat) => {
            const spent = spendByCat[cat] || 0;
            const limit = limits[cat];
            const hasLimit = limit !== undefined && limit > 0;
            const pct = hasLimit ? Math.min((spent / limit) * 100, 100) : 0;
            const over = hasLimit && spent > limit;
            return (
              <div key={cat} className={s.budgetRow}>
                <span className={s.budgetCat}>
                  <span className={s.dot} style={{ background: categoryColor(cat) }} />
                  {cat}
                </span>

                <div className={s.budgetProgress}>
                  <div className={s.barTrack}>
                    <div
                      className={s.barFill}
                      style={{
                        width: `${pct}%`,
                        background: over ? 'var(--danger)' : categoryColor(cat)
                      }}
                    />
                  </div>
                  <div className={s.budgetMeta}>
                    <span>{fmtUSD.format(spent)} spent</span>
                    {hasLimit ? (
                      <span className={over ? s.over : undefined}>
                        {over
                          ? `${fmtUSD.format(spent - limit)} over`
                          : `${fmtUSD.format(limit - spent)} left`}
                      </span>
                    ) : (
                      <span>No budget set</span>
                    )}
                  </div>
                </div>

                <div className={s.budgetInput}>
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    placeholder="Limit"
                    value={drafts[cat] ?? ''}
                    disabled={savingCat === cat}
                    onChange={(e) => setDrafts((p) => ({ ...p, [cat]: e.target.value }))}
                    onBlur={() => commit(cat)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function Stat({ label, value, sub, over }) {
  return (
    <div className={s.statCard}>
      <div className={s.statLabel}>{label}</div>
      <div className={s.statValue} style={over ? { color: 'var(--danger)' } : undefined}>{value}</div>
      {sub && <div className={s.statSub}>{sub}</div>}
    </div>
  );
}
