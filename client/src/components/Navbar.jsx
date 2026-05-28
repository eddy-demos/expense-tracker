import { Wallet, Bell, UserCircle } from '@phosphor-icons/react';
import styles from './Navbar.module.css';

export default function Navbar() {
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
