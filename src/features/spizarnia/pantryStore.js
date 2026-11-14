/* =========================================================
   Spiżarnia: model danych, reducer i funkcje pomocnicze.
   Bez Reacta, więc można tego używać wszędzie (też w testach).
   ========================================================= */

// Jeden klucz w localStorage na całą spiżarnię (ta sama konwencja co foodlab.dziennik itd.)
export const STORAGE_KEY = 'foodlab.spizarnia';

export const UNITS = [
  { value: 'szt', label: 'szt.', step: 1 },
  { value: 'g', label: 'g', step: 100 },
  { value: 'kg', label: 'kg', step: 0.5 },
  { value: 'ml', label: 'ml', step: 100 },
  { value: 'l', label: 'l', step: 0.5 },
  { value: 'opak', label: 'opak.', step: 1 },
];

export const SOON_DAYS = 3; // tyle dni przed końcem daty produkt jest oznaczony jako "kończy się"

/*
  Produkt w spiżarni:
  {
    id: string,
    name: string,             // nazwa po polsku, np. "Mleko 2%"
    quantity: number,         // ilość, np. 1.5
    unit: 'szt'|'g'|'kg'|'ml'|'l'|'opak',
    expiry: 'RRRR-MM-DD' | '',// data ważności, pusty napis = bez daty
    addedAt: string,          // ISO, kiedy dodano
    // pola opcjonalne, np. gdy produkt przychodzi z bazy produktów (Open Food Facts):
    nameEn?: string,          // angielska nazwa dla Spoonacular (przepisy)
    barcode?: string,
    source?: 'reczne' | 'openfoodfacts',
    nutrition?: { kcal, protein, fat, carbs } // na 100 g / 100 ml
  }
*/

export function unitInfo(unit) {
  return UNITS.find((u) => u.value === unit) ?? UNITS[0];
}

export function normalizeName(name) {
  return String(name ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toNumber(value, fallback = 0) {
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 1000) / 1000 : fallback;
}

// Ujednolica produkt (z formularza, z innego modułu albo z localStorage)
export function makeItem(input) {
  const item = {
    id: input.id ?? newId(),
    name: String(input.name ?? '').trim(),
    quantity: toNumber(input.quantity, 1),
    unit: UNITS.some((u) => u.value === input.unit) ? input.unit : 'szt',
    expiry: /^\d{4}-\d{2}-\d{2}$/.test(input.expiry ?? '') ? input.expiry : '',
    addedAt: input.addedAt ?? new Date().toISOString(),
  };
  if (input.nameEn) item.nameEn = String(input.nameEn).trim();
  if (input.barcode) item.barcode = String(input.barcode);
  if (input.source) item.source = input.source;
  if (input.nutrition) item.nutrition = input.nutrition;
  return item;
}

export function loadPantry() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((p) => p && p.name).map(makeItem) : [];
  } catch {
    return [];
  }
}

export function savePantry(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* brak miejsca albo zablokowany localStorage: stan zostaje w pamięci */
  }
}

/* ---------- reducer ---------- */

export function pantryReducer(items, action) {
  switch (action.type) {
    case 'add': {
      const item = makeItem(action.item);
      if (!item.name) return items;
      // ten sam produkt, ta sama jednostka i data: zwiększamy ilość zamiast dublować wiersz
      const same = items.find(
        (p) => normalizeName(p.name) === normalizeName(item.name) && p.unit === item.unit && p.expiry === item.expiry,
      );
      if (same) {
        return items.map((p) => (p.id === same.id ? { ...p, quantity: toNumber(p.quantity + item.quantity) } : p));
      }
      return [...items, item];
    }
    case 'update':
      return items.map((p) => (p.id === action.id ? makeItem({ ...p, ...action.changes, id: p.id }) : p));
    case 'changeQuantity':
      return items.map((p) =>
        p.id === action.id ? { ...p, quantity: Math.max(0, toNumber(p.quantity + action.delta)) } : p,
      );
    case 'remove':
      return items.filter((p) => p.id !== action.id);
    case 'restore': {
      // cofnięcie usunięcia: wraca na to samo miejsce
      if (items.some((p) => p.id === action.item.id)) return items;
      const next = [...items];
      next.splice(Math.min(action.index ?? next.length, next.length), 0, action.item);
      return next;
    }
    case 'removeExpired':
      return items.filter((p) => expiryStatus(p.expiry) !== 'expired');
    case 'replace':
      return Array.isArray(action.items) ? action.items.map(makeItem) : items;
    default:
      return items;
  }
}

/* ---------- daty ważności ---------- */

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(days, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return todayKey(d);
}

// Ile dni zostało do końca daty (0 = dziś, ujemne = po terminie, null = bez daty)
export function daysUntil(expiry, now = new Date()) {
  if (!expiry) return null;
  const [y, m, d] = expiry.split('-').map(Number);
  const end = new Date(y, m - 1, d);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((end - start) / 86400000);
}

export function expiryStatus(expiry, now = new Date()) {
  const days = daysUntil(expiry, now);
  if (days === null) return 'none';
  if (days < 0) return 'expired';
  if (days <= SOON_DAYS) return 'soon';
  return 'ok';
}

function dni(n) {
  return n === 1 ? '1 dzień' : `${n} dni`;
}

export function expiryLabel(expiry, now = new Date()) {
  const days = daysUntil(expiry, now);
  if (days === null) return 'bez daty ważności';
  if (days < 0) return `po terminie od ${dni(-days)}`;
  if (days === 0) return 'termin mija dziś';
  if (days === 1) return 'termin mija jutro';
  return `ważne jeszcze ${dni(days)}`;
}

export function formatDate(expiry) {
  if (!expiry) return '';
  const [y, m, d] = expiry.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatQuantity(quantity, unit) {
  const n = Number(quantity).toLocaleString('pl-PL', { maximumFractionDigits: 2 });
  return `${n} ${unitInfo(unit).label}`;
}

/* ---------- sortowanie ---------- */

export const SORTS = [
  { value: 'expiry', label: 'Data ważności' },
  { value: 'name', label: 'Nazwa' },
  { value: 'added', label: 'Ostatnio dodane' },
];

export function sortPantry(items, sort) {
  const list = [...items];
  if (sort === 'name') return list.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  if (sort === 'added') return list.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  // data ważności: najkrócej ważne na górze, produkty bez daty na końcu
  return list.sort((a, b) => {
    if (!a.expiry && !b.expiry) return a.name.localeCompare(b.name, 'pl');
    if (!a.expiry) return 1;
    if (!b.expiry) return -1;
    return a.expiry.localeCompare(b.expiry);
  });
}

/* ---------- dla innych modułów ---------- */

// Produkty, które faktycznie są (ilość > 0 i nie po terminie)
export function availableItems(items, now = new Date()) {
  return items.filter((p) => p.quantity > 0 && expiryStatus(p.expiry, now) !== 'expired');
}

// Nazwy do wyszukiwania przepisów (Spoonacular findByIngredients chce angielskich nazw po przecinku)
export function ingredientNames(items, { english = true } = {}) {
  const names = availableItems(items).map((p) => (english && p.nameEn ? p.nameEn : p.name));
  return [...new Set(names.map(normalizeName))];
}

// Czy dany składnik jest w spiżarni (porównanie bez wielkości liter, po nazwie polskiej i angielskiej)
export function hasIngredient(items, name) {
  const wanted = normalizeName(name);
  if (!wanted) return false;
  return availableItems(items).some((p) => {
    const pl = normalizeName(p.name);
    const en = normalizeName(p.nameEn);
    return pl === wanted || en === wanted || pl.includes(wanted) || (en && en.includes(wanted));
  });
}
