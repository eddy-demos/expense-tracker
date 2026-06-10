import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, SquaresFour, ChartBar, Target, Gear, Sun, Moon } from '@phosphor-icons/react';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/', label: 'Dashboard', icon: SquaresFour, end: true },
  { to: '/reports', label: 'Reports', icon: ChartBar },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/settings', label: 'Settings', icon: Gear }
];

export default function Sidebar() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <aside className={styles.sidebar}>
      <NavLink to="/" className={styles.logo}>
        <Wallet weight="fill" size={24} />
        <span className={styles.logoText}>ExpenseTracker</span>
      </NavLink>

      <nav className={styles.nav}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <Icon weight="fill" size={20} />
            <span className={styles.linkText}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        className={styles.themeBtn}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
      >
        {dark ? <Sun weight="fill" size={20} /> : <Moon weight="fill" size={20} />}
        <span className={styles.linkText}>{dark ? 'Light mode' : 'Dark mode'}</span>
      </button>
    </aside>
  );
}
