import { useEffect } from 'react';
import { fmtUSD, paymentLabel, categoryColor } from '../api.js';
import styles from './ExpenseDetailDialog.module.css';

export default function ExpenseDetailDialog({ expense, open, onClose }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !expense) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="detail-title">Expense Details</h2>
          <button className="icon" onClick={onClose} title="Close">&times;</button>
        </div>

        <div className={styles.body}>
          <div className={styles.row}>
            <span className={styles.label}>Description</span>
            <span className={styles.value}>{expense.description}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Amount</span>
            <span className={`${styles.value} ${styles.amount}`}>{fmtUSD.format(expense.amount)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Category</span>
            <span className={styles.value}>
              <span className={styles.pill} style={{ background: categoryColor(expense.category) }}>
                {expense.category}
              </span>
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Date</span>
            <span className={styles.value}>{expense.date}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Payment Method</span>
            <span className={styles.value}>{paymentLabel(expense.payment_method)}</span>
          </div>
          {expense.created_at && (
            <div className={styles.row}>
              <span className={styles.label}>Added On</span>
              <span className={styles.value}>
                {new Date(expense.created_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
