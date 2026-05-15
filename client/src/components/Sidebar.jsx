import styles from './Sidebar.module.css';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'expenses', label: 'Expenses', icon: '💰' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Expense Tracker</div>
      <nav className={styles.nav}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={t.id === active ? styles.tabActive : styles.tab}
            onClick={() => onNavigate(t.id)}
          >
            <span className={styles.tabIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
