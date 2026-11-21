/* =========================================================
   Baza produktów (Michał): zapytania do Open Food Facts (bez klucza API)
   i sprowadzenie odpowiedzi do prostej struktury:
   { id, name, brand, barcode, image, pack, nutrition, source }
   nutrition = { kcal, protein, fat, carbs } na 100 g / 100 ml albo null, gdy API nie ma danych.
   ========================================================= */
import { parsePackage } from '../spizarnia/barcode.js';

const BASE = 'https://world.openfoodfacts.org';
const FIELDS = [
  'code',
  'product_name',
  'product_name_pl',
  'product_name_en',
  'generic_name_pl',
  'brands',
  'quantity',
  'nutriments',
  'image_front_small_url',
].join(',');
const TIMEOUT_MS = 12000;
export const PAGE_SIZE = 24;

// Błąd z podziałem na przyczynę, żeby interfejs mógł pokazać czytelny komunikat
export class ApiError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind; // 'offline' | 'timeout' | 'http'
  }
}

async function getJson(url, signal) {
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError('http', `Open Food Facts: HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (signal?.aborted) throw err; // anulowane przez nas (nowe wyszukiwanie), nie błąd
    if (timedOut) throw new ApiError('timeout', 'Open Food Facts nie odpowiada');
    throw new ApiError('offline', 'Brak połączenia z Open Food Facts');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

const num = (v) => {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
};
const round = (n) => Math.round(n * 10) / 10;

// Z całej odpowiedzi wyciągamy tylko kcal i makro na 100 g
export function mapNutrition(nutriments = {}) {
  const protein = num(nutriments.proteins_100g);
  const fat = num(nutriments.fat_100g);
  const carbs = num(nutriments.carbohydrates_100g);
  let kcal = num(nutriments['energy-kcal_100g']);
  if (kcal === undefined && num(nutriments.energy_100g) !== undefined) kcal = num(nutriments.energy_100g) / 4.184; // kJ -> kcal
  if (kcal === undefined && [protein, fat, carbs].every((v) => v !== undefined)) kcal = protein * 4 + fat * 9 + carbs * 4;
  if (kcal === undefined) return null;
  return { kcal: Math.round(kcal), protein: round(protein ?? 0), fat: round(fat ?? 0), carbs: round(carbs ?? 0) };
}

// Jeden produkt z OFF -> nasz format. null = nic z tego nie zrobimy (brak nazwy).
export function mapProduct(p) {
  if (!p) return null;
  const name = String(p.product_name_pl || p.product_name || p.generic_name_pl || p.product_name_en || '').trim();
  const brand = String(p.brands ?? '').split(',')[0].trim();
  if (!name && !brand) return null;
  const code = String(p.code ?? p._id ?? '');
  return {
    id: `off-${code || name}`,
    name: name || brand,
    brand: name ? brand : '',
    nameEn: p.product_name_en ? String(p.product_name_en).trim() : undefined,
    barcode: code,
    image: p.image_front_small_url || '',
    pack: parsePackage(p.quantity),
    nutrition: mapNutrition(p.nutriments),
    source: 'openfoodfacts',
  };
}

// Wyszukiwanie po nazwie. Zwraca tablicę (może być pusta), rzuca ApiError.
export async function searchProducts(query, { signal } = {}) {
  const q = query.trim();
  const url =
    `${BASE}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1` +
    `&page_size=${PAGE_SIZE}&sort_by=unique_scans_n&fields=${FIELDS}`;
  const data = await getJson(url, signal);
  const seen = new Set();
  return (data?.products ?? [])
    .map(mapProduct)
    .filter((p) => p && !seen.has(p.id) && seen.add(p.id));
}

// Wyszukiwanie po kodzie kreskowym. null = kodu nie ma w bazie.
export async function fetchByBarcode(code, { signal } = {}) {
  const data = await getJson(`${BASE}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`, signal);
  if (!data || data.status !== 1) return null;
  return mapProduct({ ...data.product, code: data.product?.code ?? code });
}
