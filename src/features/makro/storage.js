import { useCallback, useState } from 'react';

// Stan zapisywany w localStorage. Odczyt i zapis w try/catch (tryb prywatny, zablokowane dane).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* brak miejsca albo zablokowany localStorage: stan zostaje w pamięci */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update];
}

// Klucz dnia w czasie lokalnym, np. "2026-11-14"
export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
