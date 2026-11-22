/* =========================================================
   USDA FoodData Central: produkty nieprzetworzone (owoce, warzywa, mięso...)
   z wartościami odżywczymi na 100 g. Darmowy klucz w VITE_USDA_KEY (.env.local).
   Baza jest po angielsku: polskie hasło tłumaczymy słownikiem z modułu przepisów,
   a nazwy wyników tłumaczymy na polski (best effort, jak w przepisach).
   Bez klucza albo przy błędzie po prostu nic nie zwracamy.
   ========================================================= */
import { normalize, queryName } from '../przepisy/ingredients.js';
import { translateMany } from '../przepisy/translate.js';
import { searchBasic } from './basicProducts.js';

const KEY = import.meta.env.VITE_USDA_KEY;
export const HAS_USDA = Boolean(KEY);
const URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const PAGE = 8;

// numery składników w FoodData Central
const N = { kcal: [1008, 2047, 2048], protein: [1003], fat: [1004], carbs: [1005] };

function pick(nutrients, ids) {
  for (const id of ids) {
    const hit = nutrients.find((n) => n.nutrientId === id && Number.isFinite(n.value));
    if (hit) return hit.value;
  }
  return undefined;
}

const r1 = (n) => Math.round((n ?? 0) * 10) / 10;

function mapFood(f) {
  const ns = f.foodNutrients ?? [];
  const kcal = pick(ns, N.kcal);
  if (kcal === undefined) return null;
  return {
    id: `usda-${f.fdcId}`,
    name: f.description,
    brand: '',
    nameEn: String(f.description).split(',')[0].trim().toLowerCase(),
    barcode: '',
    // USDA nie ma zdjęć: bierzemy zdjęcie pasującego produktu podstawowego (np. "oranges" -> Pomarańcza)
    image: searchBasic(String(f.description).split(',')[0])[0]?.image ?? '',
    pack: null,
    nutrition: { kcal: Math.round(kcal), protein: r1(pick(ns, N.protein)), fat: r1(pick(ns, N.fat)), carbs: r1(pick(ns, N.carbs)) },
    source: 'usda',
  };
}

export async function searchUsda(query, { signal } = {}) {
  if (!HAS_USDA) return [];
  // "pomarańcza" -> "orange"; gdy słownik nie zna słowa, USDA i tak nic sensownego nie znajdzie
  const en = queryName({ name: query });
  if (!en || en === normalize(query)) {
    if (!/^[a-z\s]+$/i.test(query.trim())) return [];
  }
  const qs = new URLSearchParams({
    api_key: KEY,
    query: en && en !== normalize(query) ? en : query.trim(),
    dataType: 'Foundation,SR Legacy',
    pageSize: String(PAGE),
  });
  const res = await fetch(`${URL}?${qs}`, { signal });
  if (!res.ok) throw new Error(`USDA: HTTP ${res.status}`);
  const data = await res.json();
  // najpierw produkty surowe ("Oranges, raw"), potem przetworzone (marmolada, sorbet...)
  const raw = (f) => (/\braw\b/i.test(f.name) ? 0 : 1);
  const foods = (data.foods ?? []).map(mapFood).filter(Boolean).sort((a, b) => raw(a) - raw(b));
  // nazwy po polsku; gdy tłumaczenie się nie uda, zostaje angielski opis
  const pl = await translateMany(foods.map((f) => f.name), { signal }).catch(() => new Map());
  return foods.map((f) => ({ ...f, name: pl.get(f.name) ?? f.name }));
}
