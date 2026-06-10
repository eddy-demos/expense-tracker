import { useState, useEffect, useCallback } from 'react';
import { api, fmtUSD, monthStartISO, monthEndISO, weekStartISO, todayISO } from '../api.js';
import { useQueryState } from '../useQueryState.js';
import SummaryPanel from '../components/SummaryPanel.jsx';
import Toolbar from '../components/Toolbar.jsx';
import ExpenseList from '../components/ExpenseList.jsx';
import ExpenseModal from '../components/ExpenseModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ExpenseDetailDialog from '../components/ExpenseDetailDialog.jsx';

export default function Dashboard() {
  const [filters, setFilters] = useQueryState({
    start_date: monthStartISO(),
    end_date: monthEndISO(),
    category: '',
    sort: 'date_desc'
  });

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [viewing, setViewing] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, sum, cats, todaySum, weekSum, monthSum] = await Promise.all([
        api.listExpenses(filters),
        api.summary({ start_date: filters.start_date, end_date: filters.end_date }),
        api.categories(),
        api.summary({ start_date: todayISO(), end_date: todayISO() }),
        api.summary({ start_date: weekStartISO(), end_date: todayISO() }),
        api.summary({ start_date: monthStartISO(), end_date: monthEndISO() })
      ]);
      setExpenses(list);
      setSummary(sum);
      setCategories(cats);
      setTodayTotal(todaySum.total);
      setWeekTotal(weekSum.total);
      setMonthTotal(monthSum.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { reload(); }, [reload]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(exp) {
    setEditing(exp);
    setModalOpen(true);
  }

  async function handleSubmit(body) {
    if (editing) {
      await api.updateExpense(editing.id, body);
    } else {
      await api.createExpense(body);
    }
    setModalOpen(false);
    setEditing(null);
    await reload();
  }

  function requestDelete(exp) {
    setDeleting(exp);
  }

  async function confirmDelete() {
    if (!deleting) return;
    await api.deleteExpense(deleting.id);
    await reload();
    setDeleting(null);
  }

  return (
    <>
      <h1 className="pageTitle">Dashboard</h1>

      {error && <div className="section" style={{ color: 'var(--danger)' }}>Error: {error}</div>}

      <SummaryPanel
        summary={summary}
        todayTotal={todayTotal}
        weekTotal={weekTotal}
        monthTotal={monthTotal}
        startDate={filters.start_date}
        endDate={filters.end_date}
        onDateChange={setFilters}
      />

      <Toolbar
        categories={categories}
        category={filters.category}
        sort={filters.sort}
        onChange={setFilters}
        onAdd={openAdd}
      />

      {loading ? (
        <div className="section">Loading…</div>
      ) : (
        <ExpenseList expenses={expenses} onEdit={openEdit} onDelete={requestDelete} onRowClick={setViewing} />
      )}

      <ExpenseModal
        open={modalOpen}
        mode={editing ? 'edit' : 'add'}
        initial={editing}
        categories={categories}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />

      <ExpenseDetailDialog
        expense={viewing}
        open={!!viewing}
        onClose={() => setViewing(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete expense?"
        message={deleting && (
          <>
            This will permanently delete{' '}
            <strong>"{deleting.description}"</strong> ({fmtUSD.format(deleting.amount)}).
            This action cannot be undone.
          </>
        )}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
