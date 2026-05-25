import { PencilSimple, Trash } from '@phosphor-icons/react';
import { fmtUSD, paymentLabel, categoryColor } from '../api.js';
import styles from './ExpenseList.module.css';

export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="section">
        <p className={styles.empty}>No expenses yet — add your first one.</p>
      </div>
    );
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="section" style={{ padding: 0, overflowX: 'auto' }}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Payment Method</th>
            <th className={styles.right}>Amount</th>
            <th className={styles.actionsCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(e => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.description}</td>
              <td>
                <span className={styles.pill} style={{ background: categoryColor(e.category) }}>
                  {e.category}
                </span>
              </td>
              <td>{paymentLabel(e.payment_method)}</td>
              <td className={styles.right}>{fmtUSD.format(e.amount)}</td>
              <td className={styles.actions}>
                <button className="icon" onClick={() => onEdit(e)} title="Edit"><PencilSimple weight="fill" size={16} /></button>
                <button className="icon" onClick={() => onDelete(e)} title="Delete"><Trash weight="fill" size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className={styles.right}><strong>Total ({expenses.length})</strong></td>
            <td className={styles.right}><strong>{fmtUSD.format(total)}</strong></td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
