import { Sun, Moon, Desktop } from '@phosphor-icons/react';
import { useTheme } from '../lib/theme.js';
import styles from './Settings.module.css';

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Desktop },
];

export default function Settings() {
  const [theme, setTheme] = useTheme();

  return (
    <>
      <h1>Settings</h1>

      <div className="section">
        <h3 className={styles.title}>Appearance</h3>
        <p className={styles.hint}>
          Choose how ExpenseTracker looks. System follows your OS preference.
        </p>
        <div className={styles.options}>
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              className={`${styles.option} ${theme === value ? styles.selected : ''}`}
              onClick={() => setTheme(value)}
            >
              <Icon size={20} weight={theme === value ? 'fill' : 'regular'} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h3 className={styles.title}>About</h3>
        <p className={styles.hint}>
          ExpenseTracker demo app. Expenses are stored in a local SQLite database;
          budgets and appearance are saved in this browser.
        </p>
      </div>
    </>
  );
}
