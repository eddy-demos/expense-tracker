import { useState } from 'react';
import { api } from '../api.js';
import styles from './Settings.module.css';

export default function Settings({ categories, onReload }) {
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  async function handleAddCategory(e) {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    setAdding(true);
    setAddError(null);
    try {
      const created = await api.createExpense({
        description: '__category_seed__',
        amount: 0,
        category: name,
        payment_method: 'other',
        date: new Date().toISOString().slice(0, 10),
      });
      if (created?.id) {
        await api.deleteExpense(created.id);
      }
      setNewCategory('');
      onReload();
    } catch (err) {
      setAddError(err.message || 'Failed to add category');
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm('Are you sure you want to delete ALL expenses? This cannot be undone.')) return;
    setDeleteError(null);
    try {
      const all = await api.listExpenses({});
      await Promise.all(all.map((e) => api.deleteExpense(e.id)));
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete all expenses');
    } finally {
      onReload();
    }
  }

  async function handleExport(format) {
    try {
      const expenses = await api.listExpenses({});
      let content, filename, type;

      if (format === 'csv') {
        const header = 'Date,Description,Category,Payment Method,Amount';
        const csvField = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
        const rows = expenses.map(
          (e) =>
            [e.date, e.description, e.category, e.payment_method, e.amount].map(csvField).join(',')
        );
        content = [header, ...rows].join('\n');
        filename = 'expenses.csv';
        type = 'text/csv';
      } else {
        content = JSON.stringify(expenses, null, 2);
        filename = 'expenses.json';
        type = 'application/json';
      }

      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={styles.settings}>
      <div className="section">
        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Categories</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {categories.map((c) => (
              <span
                key={c}
                style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  fontSize: 13,
                }}
              >
                {c}
              </span>
            ))}
            {categories.length === 0 && (
              <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                No categories yet
              </span>
            )}
          </div>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 8 }}>
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              style={{ flex: 1, width: 'auto' }}
            />
            <button type="submit" className="primary" disabled={adding}>
              {adding ? 'Adding...' : 'Add'}
            </button>
          </form>
          {addError && (
            <p style={{ color: 'var(--danger)', fontSize: 13, margin: '4px 0 0' }}>{addError}</p>
          )}
        </div>
      </div>

      <div className="section">
        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Export Data</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
            Download all your expenses as a file.
          </p>
          <div className={styles.exportRow}>
            <button onClick={() => handleExport('csv')}>Export as CSV</button>
            <button onClick={() => handleExport('json')}>Export as JSON</button>
          </div>
        </div>
      </div>

      <div className={`section ${styles.dangerZone}`}>
        <div className={styles.group}>
          <h3 className={styles.groupTitle} style={{ color: 'var(--danger)' }}>
            Danger Zone
          </h3>
          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <span>Delete all expenses</span>
              <span>This action cannot be undone.</span>
            </div>
            <button className="danger" onClick={handleDeleteAll}>
              Delete All
            </button>
          </div>
          {deleteError && (
            <p style={{ color: 'var(--danger)', fontSize: 13, margin: '8px 0 0' }}>{deleteError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
