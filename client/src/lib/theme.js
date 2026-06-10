import { useSyncExternalStore } from 'react';

// 'light' | 'dark' | 'system' — 'system' means no stored preference
export function getTheme() {
  return localStorage.theme || 'system';
}

export function appliedTheme(theme = getTheme()) {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function setTheme(theme) {
  if (theme === 'system') {
    delete localStorage.theme;
  } else {
    localStorage.theme = theme;
  }
  document.documentElement.classList.toggle('dark', appliedTheme(theme) === 'dark');
  window.dispatchEvent(new Event('themechange'));
}

function subscribe(cb) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onMedia = () => {
    if (getTheme() === 'system') {
      document.documentElement.classList.toggle('dark', media.matches);
    }
    cb();
  };
  window.addEventListener('themechange', cb);
  media.addEventListener('change', onMedia);
  return () => {
    window.removeEventListener('themechange', cb);
    media.removeEventListener('change', onMedia);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme);
  return [theme, setTheme];
}
