import { useState, useEffect } from 'react';
import {
  api, fmtUSD, categoryColor, monthLabel, paymentLabel,
  monthStartISO, monthEndISO, todayISO
} from '../api.js';
import s from './pages.module.css';

const PERIODS = [
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' }
];

function periodRange(key) {
  const now = new Date();
  if (key === 'month') return { start_date: monthStartISO(), end_date: monthEndISO() };
  if (key === 'year') {
    return {
      start_date: `${now.getFullYear()}-01-01`,
      end_date: `${now.getFullYear()}-12-31`
    };
  }
  return {}; // all time
}

export default function Reports() {
  const [period, setPeriod] = useState('all');
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAnimated(false);
    Promise.all([api.summary(periodRange(period)), api.trends()])
      .then(([sum, tr]) => {
        if (cancelled) return;
        setSummary(sum);
        setTrends(tr);
        setError(null);
        requestAnimationFrame(() => !cancelled && setAnimated(true));
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [period]);

  const cats = summary?.by_category || [];
  const methods = summary?.by_payment_method || [];
  const total = summary?.total || 0;
  const catMax = cats.reduce((m, c) => Math.max(m, c.total), 0) || 1;
  const methodMax = methods.reduce((m, c) => Math.max(m, c.total), 0) || 1;
  const trendMax = trends.reduce((m, t) => Math.max(m, t.total), 0) || 1;
  const txnCount = cats.reduce((n, c) => n + c.count, 0);
  const topCat = cats[0];
  const avgPerMonth = trends.length ? trends.reduce((a, t) => a + t.total, 0) / trends.length : 0;

  return (
    <>
      <h1 className="pageTitle">Reports</h1>
      <p className="pageSubtitle">Spending trends and breakdowns across your expenses.</p>

      {error && <div className="section" style={{ color: 'var(--danger)' }}>Error: {error}</div>}

      <div className={s.sectionHead}>
        <div className={s.tabs}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={period === p.key ? `${s.tab} ${s.tabActive}` : s.tab}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.statGrid}>
        <Stat label="Total spent" value={fmtUSD.format(total)} />
        <Stat label="Transactions" value={txnCount} />
        <Stat
          label="Top category"
          value={topCat ? topCat.category : '—'}
          sub={topCat ? fmtUSD.format(topCat.total) : null}
        />
        <Stat label="Avg / month" value={fmtUSD.format(avgPerMonth)} sub="across all months" />
      </div>

      <div className="section">
        <div className={s.sectionHead}>
          <h3 className={s.sectionTitle}>Monthly spending trend</h3>
        </div>
        {trends.length === 0 ? (
          <p className={s.empty}>No data yet.</p>
        ) : (
          <div className={s.trend}>
            {trends.map((t) => (
              <div key={t.month} className={s.trendCol}>
                <span className={s.trendValue}>{fmtUSD.format(t.total)}</span>
                <div className={s.trendBarWrap}>
                  <div
                    className={s.trendBar}
                    style={{ height: animated ? `${(t.total / trendMax) * 100}%` : '0%' }}
                  />
                </div>
                <span className={s.trendMonth}>{monthLabel(t.month)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className={s.sectionHead}>
          <h3 className={s.sectionTitle}>Spending by category</h3>
        </div>
        {cats.length === 0 ? (
          <p className={s.empty}>No data in this period.</p>
        ) : (
          <div className={s.bars}>
            {cats.map((c) => (
              <div key={c.category} className={s.barRow}>
                <span className={s.barLabel}>
                  <span className={s.dot} style={{ background: categoryColor(c.category) }} />
                  <span>{c.category}</span>
                </span>
                <div className={s.barTrack}>
                  <div
                    className={s.barFill}
                    style={{
                      width: animated ? `${(c.total / catMax) * 100}%` : '0%',
                      background: categoryColor(c.category)
                    }}
                  />
                </div>
                <span className={s.barValue}>
                  {fmtUSD.format(c.total)}
                  <span className={s.barPct}>{total ? Math.round((c.total / total) * 100) : 0}%</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className={s.sectionHead}>
          <h3 className={s.sectionTitle}>Payment methods</h3>
        </div>
        {methods.length === 0 ? (
          <p className={s.empty}>No data in this period.</p>
        ) : (
          <div className={s.bars}>
            {methods.map((m) => (
              <div key={m.method} className={s.barRow}>
                <span className={s.barLabel}><span>{paymentLabel(m.method)}</span></span>
                <div className={s.barTrack}>
                  <div
                    className={s.barFill}
                    style={{
                      width: animated ? `${(m.total / methodMax) * 100}%` : '0%',
                      background: 'var(--primary)'
                    }}
                  />
                </div>
                <span className={s.barValue}>{fmtUSD.format(m.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className={s.statCard}>
      <div className={s.statLabel}>{label}</div>
      <div className={s.statValue}>{value}</div>
      {sub && <div className={s.statSub}>{sub}</div>}
    </div>
  );
}
