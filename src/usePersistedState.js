import { useState, useEffect, useRef } from "react";

// Persist a piece of state to localStorage so an in-progress game survives an
// accidental refresh or a phone locking mid-round. Falls back gracefully when
// storage is unavailable (private mode, SSR).
export function usePersistedState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = typeof localStorage !== "undefined" && localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; }
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* ignore */ }
  }, [key, state]);

  return [state, setState];
}

export function clearPersisted(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}
