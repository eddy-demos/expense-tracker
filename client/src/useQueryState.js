import { useState, useEffect, useCallback } from 'react';

function read() {
  const p = new URLSearchParams(window.location.search);
  const obj = {};
  for (const [k, v] of p.entries()) obj[k] = v;
  return obj;
}

export function useQueryState(defaults) {
  const [state, setState] = useState(() => ({ ...defaults, ...read() }));

  useEffect(() => {
    const onPop = () => setState({ ...defaults, ...read() });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const update = useCallback((patch) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      const qs = new URLSearchParams();
      Object.entries(next).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      });
      const url = `${window.location.pathname}${qs.toString() ? '?' + qs.toString() : ''}`;
      window.history.replaceState(null, '', url);
      return next;
    });
  }, []);

  return [state, update];
}
