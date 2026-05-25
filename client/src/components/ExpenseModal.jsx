import { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { PAYMENT_METHODS, todayISO } from '../api.js';
import styles from './ExpenseModal.module.css';

const empty = {
  amount: '',
  category: '',
  date: todayISO(),
  description: '',
  payment_method: 'debit'
};

export default function ExpenseModal({ open, mode, initial, categories, onClose, onSubmit }) {
  const [form, setForm] = useState(empty);
  const [newCategory, setNewCategory] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          amount: String(initial.amount),
          category: initial.category,
          date: initial.date,
          description: initial.description,
          payment_method: initial.payment_method
        });
        setNewCategory(!categories.includes(initial.category));
      } else {
        setForm({ ...empty, category: categories[0] || '' });
        setNewCategory(false);
      }
      setErrors({});
    }
  }, [open, initial]);

  if (!open) return null;

  function validate() {
    const errs = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || !Number.isFinite(amt) || amt <= 0) errs.amount = 'Enter a positive amount';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (!form.date) errs.date = 'Date is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!PAYMENT_METHODS.find(p => p.value === form.payment_method)) errs.payment_method = 'Pick a payment method';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(form.amount),
        category: form.category.trim(),
        date: form.date,
        description: form.description.trim(),
        payment_method: form.payment_method
      });
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{mode === 'edit' ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="icon" onClick={onClose}><X weight="fill" size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Field label="Amount" error={errors.amount}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              autoFocus
            />
          </Field>

          <Field label="Category" error={errors.category}>
            {newCategory ? (
              <div className={styles.row}>
                <input
                  value={form.category}
                  placeholder="New category"
                  onChange={e => setForm({ ...form, category: e.target.value })}
                />
                <button type="button" onClick={() => { setNewCategory(false); setForm({ ...form, category: categories[0] || '' }); }}>
                  Pick existing
                </button>
              </div>
            ) : (
              <div className={styles.row}>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" onClick={() => { setNewCategory(true); setForm({ ...form, category: '' }); }}>
                  + New
                </button>
              </div>
            )}
          </Field>

          <Field label="Date" error={errors.date}>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <Field label="Payment Method" error={errors.payment_method}>
            <select
              value={form.payment_method}
              onChange={e => setForm({ ...form, payment_method: e.target.value })}
            >
              {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>

          {errors._global && <div className={styles.globalError}>{errors._global}</div>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={submitting}>
              {mode === 'edit' ? 'Save changes' : 'Add expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
