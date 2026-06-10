import { useState, useEffect } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { api, fmtUSD, monthStartISO, monthEndISO, categoryColor, paymentLabel } from '../api.js';
import styles from './Reports.module.css';

const tooltipStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text)',
  fontSize: 13,
};

function shortDate(iso) {
  const [, m, d] = iso.split('-');
  return `${Number(m)}/${Number(d)}`;
}

export default function Reports() {
  const [startDate, setStartDate] = useState(monthStartISO());
  const [endDate, setEndDate] = useState(monthEndISO());
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.summary({ start_date: startDate, end_date: endDate }),
      api.listExpenses({ start_date: startDate, end_date: endDate, sort: 'date_asc' })
    ])
      .then(([s, expenses]) => {
        if (cancelled) return;
        setSummary(s);
        const byDay = new Map();
        for (const e of expenses) {
          byDay.set(e.date, (byDay.get(e.date) || 0) + e.amount);
        }
        setDaily([...byDay.entries()].map(([date, total]) => ({ date, total })));
        setError(null);
      })
      .catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [startDate, endDate]);

  const cats = summary?.by_category || [];
  const methods = summary?.by_payment_method || [];
  const total = summary?.total || 0;

  return (
    <>
      <h1>Reports</h1>

      <div className="section">
        <div className={styles.range}>
          <label>
            From
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </label>
          <div className={styles.total}>
            Total: <strong>{fmtUSD.format(total)}</strong>
          </div>
        </div>
      </div>

      {error && <div className="section" style={{ color: 'var(--danger)' }}>Error: {error}</div>}

      <div className={styles.chartsRow}>
        <div className={`section ${styles.chartSection}`}>
          <h3 className={styles.title}>Category breakdown</h3>
          {cats.length === 0 ? (
            <p className={styles.empty}>No data in the selected range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={cats}
                  dataKey="total"
                  nameKey="category"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {cats.map(c => (
                    <Cell key={c.category} fill={categoryColor(c.category)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={v => fmtUSD.format(v)}
                />
                <Legend
                  formatter={value => <span style={{ color: 'var(--text)', fontSize: 13 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={`section ${styles.chartSection}`}>
          <h3 className={styles.title}>Spending over time</h3>
          {daily.length === 0 ? (
            <p className={styles.empty}>No data in the selected range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={daily} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `$${v}`}
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'var(--hover)' }}
                  labelFormatter={shortDate}
                  formatter={v => [fmtUSD.format(v), 'Spent']}
                />
                <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="section">
        <h3 className={styles.title}>By category</h3>
        {cats.length === 0 ? (
          <p className={styles.empty}>No data in the selected range.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th className={styles.num}>Amount</th>
                <th className={styles.num}>Share</th>
                <th className={styles.barCol} />
              </tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.category}>
                  <td>
                    <span className={styles.dot} style={{ background: categoryColor(c.category) }} />
                    {c.category}
                  </td>
                  <td className={styles.num}>{fmtUSD.format(c.total)}</td>
                  <td className={styles.num}>{total ? Math.round((c.total / total) * 100) : 0}%</td>
                  <td className={styles.barCol}>
                    <div className={styles.track}>
                      <div
                        className={styles.fill}
                        style={{
                          width: `${total ? (c.total / total) * 100 : 0}%`,
                          background: categoryColor(c.category)
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section">
        <h3 className={styles.title}>By payment method</h3>
        {methods.length === 0 ? (
          <p className={styles.empty}>No data in the selected range.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Method</th>
                <th className={styles.num}>Amount</th>
                <th className={styles.num}>Share</th>
              </tr>
            </thead>
            <tbody>
              {methods.map(m => (
                <tr key={m.method}>
                  <td>{paymentLabel(m.method)}</td>
                  <td className={styles.num}>{fmtUSD.format(m.total)}</td>
                  <td className={styles.num}>{total ? Math.round((m.total / total) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
