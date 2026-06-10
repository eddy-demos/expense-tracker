import { useState, useEffect } from 'react';
import { api, paymentLabel } from '../api.js';
import { useTheme } from '../useTheme.js';
import s from './pages.module.css';

const THEME_OPTIONS = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' }
];

function toCSV(rows) {
  const headers = ['id', 'date', 'description', 'category', 'amount', 'payment_method'];
  const esc = (v) => {
    const str = String(v ?? '');
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.join(',')];
  rows.forEach((r) => {
    lines.push([r.id, r.date, r.description, r.category, r.amount, paymentLabel(r.payment_method)].map(esc).join(','));
  });
  return lines.join('\n');
}

export default function Settings() {
  const { preference, setTheme } = useTheme();
  const [count, setCount] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api.listExpenses({}).then((rows) => setCount(rows.length)).catch(() => setCount(null));
  }, []);

  async function exportCsv() {
    setExporting(true);
    try {
      const rows = await api.listExpenses({ sort: 'date_desc' });
      const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expenses.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <h1 className="pageTitle">Settings</h1>
      <p className="pageSubtitle">Manage appearance and your expense data.</p>

      <div className="section">
        <div className={s.sectionHead}>
          <h3 className={s.sectionTitle}>Appearance</h3>
        </div>
        <div className={s.field}>
          <div>
            <div className={s.fieldLabel}>Theme</div>
            <div className={s.fieldHint}>Choose light, dark, or follow your system setting.</div>
          </div>
          <div className={s.segmented}>
            {THEME_OPTIONS.map((o) => (
              <button
                key={o.key}
                className={preference === o.key ? s.segActive : undefined}
                onClick={() => setTheme(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className={s.sectionHead}>
          <h3 className={s.sectionTitle}>Data</h3>
        </div>
        <div className={s.field}>
          <div>
            <div className={s.fieldLabel}>Export expenses</div>
            <div className={s.fieldHint}>
              Download all {count ?? '…'} expense{count === 1 ? '' : 's'} as a CSV file.
            </div>
          </div>
          <button className="primary" onClick={exportCsv} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="section">
        <div className={s.sectionHead}>
          <h3 className={s.sectionTitle}>About</h3>
        </div>
        <div className={s.field}>
          <div className={s.fieldLabel}>ExpenseTracker</div>
          <div className={s.fieldHint}>Version 1.0.0</div>
        </div>
      </div>
    </>
  );
}
