import { useState } from 'react';
import { Sun, Moon } from '@phosphor-icons/react';

export default function Settings() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <div className="app">
      <h1>Settings</h1>

      <div className="section">
        <h3 style={{ marginTop: 0 }}>Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Theme</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              Currently using {dark ? 'dark' : 'light'} mode.
            </div>
          </div>
          <button className="primary" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {dark ? <Sun weight="fill" size={18} /> : <Moon weight="fill" size={18} />}
            Switch to {dark ? 'light' : 'dark'}
          </button>
        </div>
      </div>

      <div className="section">
        <h3 style={{ marginTop: 0 }}>About</h3>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 24px', fontSize: 14 }}>
          <dt style={{ color: 'var(--muted)' }}>App</dt>
          <dd style={{ margin: 0 }}>ExpenseTracker</dd>
          <dt style={{ color: 'var(--muted)' }}>Currency</dt>
          <dd style={{ margin: 0 }}>USD ($)</dd>
        </dl>
      </div>
    </div>
  );
}
