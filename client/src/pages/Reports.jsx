import { useState, useEffect } from 'react';
import { api, fmtUSD, categoryColor, monthStartISO, monthEndISO } from '../api.js';

export default function Reports() {
  const [start, setStart] = useState(monthStartISO());
  const [end, setEnd] = useState(monthEndISO());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api.summary({ start_date: start, end_date: end })
      .then(s => { if (active) setSummary(s); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [start, end]);

  const cats = [...(summary?.by_category || [])].sort((a, b) => b.total - a.total);
  const total = summary?.total || 0;

  return (
    <div className="app">
      <h1>Reports</h1>

      <div className="section">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--muted)' }}>
            From
            <input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ width: 170 }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--muted)' }}>
            To
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={{ width: 170 }} />
          </label>
          <div style={{ marginLeft: 'auto', fontSize: 15 }}>
            Total spent: <strong>{fmtUSD.format(total)}</strong>
          </div>
        </div>
      </div>

      {error && <div className="section" style={{ color: 'var(--danger)' }}>Error: {error}</div>}

      <div className="section">
        <h3 style={{ marginTop: 0 }}>Category breakdown</h3>
        {loading ? (
          <p>Loading…</p>
        ) : cats.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No data in the selected range.</p>
        ) : (
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <DonutChart cats={cats} total={total} />
          <table style={{ flex: 1, minWidth: 280, borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 4px' }}>Category</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '8px 4px', textAlign: 'right', width: 80 }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.category} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 4px' }}>
                    <span style={{
                      display: 'inline-block', width: 10, height: 10, borderRadius: 3,
                      background: categoryColor(c.category), marginRight: 8, verticalAlign: 'middle'
                    }} />
                    {c.category}
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 600 }}>{fmtUSD.format(c.total)}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--muted)' }}>
                    {total ? Math.round((c.total / total) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DonutChart({ cats, total }) {
  const size = 180;
  const stroke = 28;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const segments = cats.map(c => {
    const frac = total ? c.total / total : 0;
    const seg = {
      category: c.category,
      color: categoryColor(c.category),
      len: frac * circ,
      offset
    };
    offset += frac * circ;
    return seg;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <g transform={`rotate(-90 ${cx} ${cx})`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--bg)" strokeWidth={stroke} />
        {segments.map(s => (
          <circle
            key={s.category}
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${s.len} ${circ - s.len}`}
            strokeDashoffset={-s.offset}
          />
        ))}
      </g>
      <text x={cx} y={cx - 6} textAnchor="middle" fontSize="11" fill="var(--muted)">Total</text>
      <text x={cx} y={cx + 14} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)">
        {fmtUSD.format(total)}
      </text>
    </svg>
  );
}
