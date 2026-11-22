/* =========================================================
   Ulubione przepisy: pełna kopia przepisu w localStorage,
   więc działają bez internetu i bez zużywania limitu Spoonacular.
   ========================================================= */
import { useCallback, useEffect, useState } from 'react';

export const FAVORITES_KEY = 'foodlab.ulubione';
const MAX = 50;

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((r) => r && r.id && r.title) : [];
  } catch {
    return [];
  }
}

export function getFavorites() {
  return load();
}

export function useFavorites() {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch {
      /* brak miejsca: ulubione zostają do odświeżenia strony */
    }
  }, [items]);

  const isFavorite = useCallback((id) => items.some((r) => r.id === id), [items]);
  // dodaje albo usuwa; gdy przepis już jest, a nowa wersja ma kroki, podmieniamy na pełniejszą
  const toggle = useCallback((recipe) => {
    setItems((list) =>
      list.some((r) => r.id === recipe.id)
        ? list.filter((r) => r.id !== recipe.id)
        : [{ ...recipe, savedAt: Date.now() }, ...list].slice(0, MAX),
    );
  }, []);
  const update = useCallback((recipe) => {
    setItems((list) => list.map((r) => (r.id === recipe.id ? { ...r, ...recipe } : r)));
  }, []);

  return { items, isFavorite, toggle, update };
}
