import { useState, useEffect } from 'react';
import { api, fmtUSD, monthStartISO, monthEndISO, categoryColor } from '../api.js';
import styles from './Budgets.module.css';

function loadBudgets() {
  try {
    return JSON.parse(localStorage.budgets || '{}');
  } catch {
    return {};
  }
}

export default function Budgets() {
  const [budgets, setBudgets] = useState(loadBudgets);
  const [categories, setCategories] = useState([]);
  const [spent, setSpent] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.categories(),
      api.summary({ start_date: monthStartISO(), end_date: monthEndISO() })
    ])
      .then(([cats, sum]) => {
        if (cancelled) return;
        setCategories(cats);
        const byCat = {};
        for (const c of sum.by_category || []) byCat[c.category] = c.total;
        setSpent(byCat);
        setError(null);
      })
      .catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);

  function setBudget(category, value) {
    const next = { ...budgets };
    const amount = parseFloat(value);
    if (!value || isNaN(amount) || amount <= 0) {
      delete next[category];
    } else {
      next[category] = amount;
    }
    setBudgets(next);
    localStorage.budgets = JSON.stringify(next);
  }

  const names = categories.map(c => (typeof c === 'string' ? c : c.name));

  return (
    <>
      <h1>Budgets</h1>

      {error && <div className="section" style={{ color: 'var(--danger)' }}>Error: {error}</div>}

      <div className="section">
        <p className={styles.hint}>
          Set a monthly budget per category. Progress reflects spending this month.
        </p>
        <div className={styles.list}>
          {names.map(name => {
            const budget = budgets[name];
            const used = spent[name] || 0;
            const pct = budget ? Math.min((used / budget) * 100, 100) : 0;
            const over = budget && used > budget;
            return (
              <div key={name} className={styles.row}>
                <span className={styles.name}>
                  <span className={styles.dot} style={{ background: categoryColor(name) }} />
                  {name}
                </span>
                <div className={styles.progress}>
                  {budget ? (
                    <>
                      <div className={styles.track}>
                        <div
                          className={`${styles.fill} ${over ? styles.overFill : ''}`}
                          style={{ width: `${pct}%`, background: over ? undefined : categoryColor(name) }}
                        />
                      </div>
                      <span className={`${styles.usage} ${over ? styles.over : ''}`}>
                        {fmtUSD.format(used)} / {fmtUSD.format(budget)}
                        {over && ' — over budget'}
                      </span>
                    </>
                  ) : (
                    <span className={styles.noBudget}>
                      No budget set{used > 0 && ` — spent ${fmtUSD.format(used)} this month`}
                    </span>
                  )}
                </div>
                <label className={styles.amount}>
                  $
                  <input
                    type="number"
                    min="0"
                    step="10"
                    placeholder="0"
                    value={budget ?? ''}
                    onChange={e => setBudget(name, e.target.value)}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
