import { NavLink } from 'react-router-dom';
import { SquaresFour, ChartBar, PiggyBank, GearSix } from '@phosphor-icons/react';
import styles from './Sidebar.module.css';

const ITEMS = [
  { to: '/', label: 'Dashboard', icon: SquaresFour, end: true },
  { to: '/reports', label: 'Reports', icon: ChartBar },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/settings', label: 'Settings', icon: GearSix },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            <Icon size={20} weight="fill" />
            <span className={styles.label}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
