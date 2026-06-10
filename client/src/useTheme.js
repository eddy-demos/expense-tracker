import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'theme';

function systemPrefersDark() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Stored preference: 'light' | 'dark' | 'system'.
function getStoredPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch (e) {}
  return 'system';
}

function resolve(pref) {
  if (pref === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return pref;
}

export function useTheme() {
  const [preference, setPreference] = useState(getStoredPreference);
  const [resolved, setResolved] = useState(() => resolve(getStoredPreference()));

  // Apply the resolved theme to <html> and persist the preference.
  useEffect(() => {
    const next = resolve(preference);
    setResolved(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch (e) {}
  }, [preference]);

  // When following the system, react to OS-level changes live.
  useEffect(() => {
    if (preference !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next = mq.matches ? 'dark' : 'light';
      setResolved(next);
      document.documentElement.classList.toggle('dark', next === 'dark');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  // Sidebar quick-toggle: flip to the opposite of what's currently showing.
  const toggle = useCallback(() => {
    setPreference(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved]);

  return { preference, theme: resolved, setTheme: setPreference, toggle };
}
