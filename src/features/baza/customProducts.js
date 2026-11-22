// Produkty dodane ręcznie, trzymane w localStorage (klucz w konwencji foodlab.*)
import { useCallback, useEffect, useState } from 'react';

export const CUSTOM_KEY = 'foodlab.baza.wlasne';

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((p) => p?.name) : [];
  } catch {
    return [];
  }
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `own-${crypto.randomUUID()}`;
  return `own-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const MAX = 1000;
export const toNum = (v) => {
  const n = Number(String(v).trim().replace(',', '.'));
  return String(v).trim() !== '' && Number.isFinite(n) ? n : NaN;
};

// Sprawdza formularz ręcznego dodania. Zwraca { error } albo { product }.
export function buildCustomProduct(form) {
  const name = form.name.trim();
  if (!name) return { error: 'Wpisz nazwę produktu.' };
  const keys = ['kcal', 'protein', 'fat', 'carbs'];
  // wartości odżywcze są opcjonalne, ale jeśli wpisano choć jedną, trzeba podać wszystkie
  const empty = keys.every((k) => String(form[k] ?? '').trim() === '');
  const values = {};
  if (!empty) for (const [key, label] of [['kcal', 'kalorie'], ['protein', 'białko'], ['fat', 'tłuszcze'], ['carbs', 'węglowodany']]) {
    const n = toNum(form[key]);
    if (Number.isNaN(n) || n < 0) return { error: `Podaj ${label} jako liczbę (0 lub więcej).` };
    if (n > MAX) return { error: `Wartość „${label}” jest zbyt duża.` };
    values[key] = Math.round(n * 10) / 10;
  }
  if (!empty && values.protein + values.fat + values.carbs > 100.5) {
    return { error: 'Białko, tłuszcze i węglowodany na 100 g nie mogą razem przekraczać 100 g.' };
  }
  const barcode = form.barcode?.trim() ?? '';
  if (barcode && !/^\d{8,14}$/.test(barcode)) return { error: 'Kod kreskowy to 8 do 14 cyfr albo zostaw puste pole.' };
  return {
    product: {
      id: newId(),
      name,
      brand: form.brand?.trim() ?? '',
      barcode,
      image: '',
      pack: null,
      nutrition: empty ? null : values,
      source: 'reczne',
      addedAt: new Date().toISOString(),
    },
  };
}

export function useCustomProducts() {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(items));
    } catch {
      /* brak miejsca albo zablokowany localStorage: lista zostaje w pamięci */
    }
  }, [items]);

  const add = useCallback((product) => setItems((list) => [product, ...list]), []);
  const remove = useCallback((id) => setItems((list) => list.filter((p) => p.id !== id)), []);
  return { items, add, remove };
}
