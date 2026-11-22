/* =========================================================
   Lista zakupów: czysta logika + hook z zapisem w localStorage.
   Pozycja: { id, name, amount, unit, checked, recipes: [tytuły] }
   ========================================================= */
import { useCallback, useEffect, useState } from 'react';
import { normalize, toBase, tokens } from './ingredients.js';

export const SHOPPING_KEY = 'foodlab.zakupy';

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadList() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SHOPPING_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x) => x && x.name) : [];
  } catch {
    return [];
  }
}

// Ten sam produkt i ta sama jednostka = jedna pozycja (ilości się sumują)
const sameEntry = (a, b) =>
  [...tokens(a.name)].sort().join(' ') === [...tokens(b.name)].sort().join(' ') &&
  normalize(a.unit) === normalize(b.unit) &&
  tokens(a.name).size > 0;

const round = (n) => Math.round(n * 100) / 100;

/*
  Dopisuje braki z przepisu. rows = wiersze analizy ze statusem 'missing' albo 'partial'.
  Dla 'partial' do listy trafia tylko brakująca różnica (shortfall), dla 'missing' cała ilość.
*/
export function addMissing(list, recipeTitle, rows) {
  let next = list;
  for (const row of rows) {
    const { ingredient, status, shortfall } = row;
    const amount = status === 'partial' ? shortfall.amount : Number(ingredient.amount) || 0;
    const entry = { name: ingredient.name, nameEn: ingredient.nameEn, amount, unit: ingredient.unit ?? '' };
    const existing = next.find((x) => sameEntry(x, entry));
    if (existing) {
      next = next.map((x) =>
        x.id === existing.id
          ? {
              ...x,
              nameEn: x.nameEn ?? entry.nameEn,
              amount: round(x.amount + amount),
              checked: false,
              recipes: x.recipes.includes(recipeTitle) ? x.recipes : [...x.recipes, recipeTitle],
            }
          : x,
      );
    } else {
      next = [...next, { id: newId(), ...entry, amount: round(amount), checked: false, recipes: [recipeTitle] }];
    }
  }
  return next;
}

// Czy wszystkie braki z tego przepisu są już na liście (żeby nie dodawać ich drugi raz)
export function allOnList(list, rows) {
  return rows.length > 0 && rows.every((r) => list.some((x) => sameEntry(x, { name: r.ingredient.name, unit: r.ingredient.unit ?? '' })));
}

export function useShoppingList() {
  const [items, setItems] = useState(loadList);

  useEffect(() => {
    try {
      localStorage.setItem(SHOPPING_KEY, JSON.stringify(items));
    } catch {
      /* brak miejsca albo zablokowany localStorage: lista zostaje w pamięci */
    }
  }, [items]);

  // zmiana w innej karcie przeglądarki
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SHOPPING_KEY) setItems(loadList());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addRows = useCallback((title, rows) => setItems((l) => addMissing(l, title, rows)), []);
  const toggle = useCallback((id) => setItems((l) => l.map((x) => (x.id === id ? { ...x, checked: !x.checked } : x))), []);
  const remove = useCallback((id) => setItems((l) => l.filter((x) => x.id !== id)), []);
  const removeMany = useCallback((ids) => setItems((l) => l.filter((x) => !ids.includes(x.id))), []);
  const clear = useCallback(() => setItems([]), []);

  return { items, addRows, toggle, remove, removeMany, clear };
}

// Kupione rzeczy wędrują do spiżarni: jednostkę sprowadzamy do tych, które zna spiżarnia (szt, g, ml)
export function toPantryEntry(item) {
  // nameEn tylko wtedy, gdy znamy prawdziwą angielską nazwę (z API); polska nazwa w nameEn psuje zapytania do Spoonacular
  const nameEn = item.nameEn || undefined;
  const base = toBase(item.amount, item.unit);
  if (!base) return { name: item.name, nameEn, quantity: 1, unit: 'szt' };
  const unit = base.kind === 'mass' ? 'g' : base.kind === 'volume' ? 'ml' : 'szt';
  return { name: item.name, nameEn, quantity: Math.max(1, Math.round(base.value)), unit };
}
