import { Link } from 'react-router-dom';
import { Wallet, Bell, UserCircle, Sun, Moon } from '@phosphor-icons/react';
import { useTheme, appliedTheme } from '../lib/theme.js';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [theme, setTheme] = useTheme();
  const dark = appliedTheme(theme) === 'dark';

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <Wallet weight="fill" size={24} />
          ExpenseTracker
        </Link>

        <div className={styles.right}>
          <button
            className={styles.iconBtn}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme(dark ? 'light' : 'dark')}
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
