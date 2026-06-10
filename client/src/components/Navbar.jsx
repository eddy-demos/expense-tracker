import { useState } from 'react';
import { Wallet, Bell, UserCircle, Sun, Moon } from '@phosphor-icons/react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <Wallet weight="fill" size={24} />
          ExpenseTracker
        </a>

        <div className={styles.links}>
          <a href="/" className={styles.active}>Dashboard</a>
          <a href="#">Reports</a>
          <a href="#">Budgets</a>
          <a href="#">Settings</a>
        </div>

        <div className={styles.right}>
          <button
            className={styles.iconBtn}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            {dark ? <Sun weight="fill" size={20} /> : <Moon weight="fill" size={20} />}
          </button>
          <button className={styles.iconBtn} title="Notifications">
            <Bell weight="fill" size={20} />
            <span className={styles.badge} />
          </button>
          <button className={styles.iconBtn} title="Profile">
            <UserCircle weight="fill" size={26} />
          </button>
        </div>
      </div>
    </nav>
  );
}
