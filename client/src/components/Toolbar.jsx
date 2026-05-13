import styles from './Toolbar.module.css';

export default function Toolbar({ categories, category, sort, onChange, onAdd }) {
  return (
    <div className={`section ${styles.toolbar}`}>
      <label className={styles.field}>
        <span>Category</span>
        <select value={category || ''} onChange={e => onChange({ category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span>Sort</span>
        <select value={sort} onChange={e => onChange({ sort: e.target.value })}>
          <option value="date_desc">Date (newest first)</option>
          <option value="date_asc">Date (oldest first)</option>
          <option value="amount_desc">Amount (high to low)</option>
          <option value="amount_asc">Amount (low to high)</option>
        </select>
      </label>
      <div className={styles.spacer} />
      <button className="primary" onClick={onAdd}>+ Add Expense</button>
    </div>
  );
}
