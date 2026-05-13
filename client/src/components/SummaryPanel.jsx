import { fmtUSD, categoryColor } from '../api.js';
import styles from './SummaryPanel.module.css';

export default function SummaryPanel({ summary, todayTotal, weekTotal, monthTotal, startDate, endDate, onDateChange }) {
  const cats = summary?.by_category || [];
  const max = cats.reduce((m, c) => Math.max(m, c.total), 0) || 1;

  return (
    <div className="section">
      <div className={styles.stats}>
        <StatCard label="Total this month" value={monthTotal} />
        <StatCard label="Total this week" value={weekTotal} />
        <StatCard label="Total today" value={todayTotal} />
      </div>

      <div className={styles.range}>
        <label>
          From
          <input type="date" value={startDate} onChange={e => onDateChange({ start_date: e.target.value })} />
        </label>
        <label>
          To
          <input type="date" value={endDate} onChange={e => onDateChange({ end_date: e.target.value })} />
        </label>
        <div className={styles.rangeTotal}>
          Range total: <strong>{fmtUSD.format(summary?.total || 0)}</strong>
        </div>
      </div>

      <h3 className={styles.chartTitle}>Spending by category</h3>
      {cats.length === 0 ? (
        <p className={styles.empty}>No data in the selected range.</p>
      ) : (
        <div className={styles.chart}>
          {cats.map(c => (
            <div key={c.category} className={styles.bar}>
              <span className={styles.barLabel}>{c.category}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${(c.total / max) * 100}%`, background: categoryColor(c.category) }}
                />
              </div>
              <span className={styles.barValue}>{fmtUSD.format(c.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue}>{fmtUSD.format(value || 0)}</div>
    </div>
  );
}
