import { NavLink } from 'react-router-dom';
import {
  Wallet, House, ChartBar, Target, Gear,
  Bell, UserCircle, Moon, Sun
} from '@phosphor-icons/react';
import { useTheme } from '../useTheme.js';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/', label: 'Dashboard', icon: House, end: true },
  { to: '/reports', label: 'Reports', icon: ChartBar },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/settings', label: 'Settings', icon: Gear }
];

export default function Sidebar() {
  const { theme, toggle } = useTheme();

  return (
    <aside className={styles.sidebar}>
      <NavLink to="/" end className={styles.logo}>
        <Wallet weight="fill" size={24} />
        <span>ExpenseTracker</span>
      </NavLink>

      <nav className={styles.nav}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            <Icon weight="regular" size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.actions}>
        <button
          className={styles.iconBtn}
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun weight="fill" size={20} /> : <Moon weight="fill" size={20} />}
        </button>
        <button className={styles.iconBtn} title="Notifications" aria-label="Notifications">
          <Bell weight="fill" size={20} />
          <span className={styles.badge} />
        </button>
        <button className={styles.iconBtn} title="Profile" aria-label="Profile">
          <UserCircle weight="fill" size={24} />
        </button>
      </div>
    </aside>
  );
}
