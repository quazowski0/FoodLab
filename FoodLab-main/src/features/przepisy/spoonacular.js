/* =========================================================
   Spoonacular: klient API z oszczędzaniem darmowego limitu.
   - klucz z VITE_SPOONACULAR_KEY (plik .env.local, patrz .env.example),
   - cache odpowiedzi w localStorage (lista propozycji 12 h, szczegóły przepisu na stałe),
   - licznik zapytań z dnia i twardy bezpiecznik DAILY_LIMIT.
   ========================================================= */
import { categoriesFromDishTypes } from '../makro/categories.js';
import { localizeList, localizeRecipe } from './translate.js';

const BASE = 'https://api.spoonacular.com';
const KEY = import.meta.env.VITE_SPOONACULAR_KEY;
export const HAS_KEY = Boolean(KEY);

export const DAILY_LIMIT = 100; // zapytań na dobę, darmowy plan ma 150 punktów, więc zostaje zapas
const SUGGEST_TTL = 12 * 60 * 60 * 1000;
const MAX_DETAILS = 40;

const USAGE_KEY = 'foodlab.przepisy.uzycie';
const SUGGEST_KEY = 'foodlab.przepisy.propozycje';
const DETAILS_KEY = 'foodlab.przepisy.szczegoly';

// Błąd z przyczyną: 'limit' (nasz bezpiecznik), 'quota' (limit Spoonacular), 'key', 'timeout', 'offline', 'http'
export class RecipeApiError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* brak miejsca albo zablokowany localStorage: działamy bez cache */
  }
}

/* ---------- limit zapytań ---------- */

const today = () => new Date().toLocaleDateString('sv-SE'); // RRRR-MM-DD w czasie lokalnym

export function getUsage() {
  const u = read(USAGE_KEY, null);
  return u && u.date === today() ? u.count : 0;
}
function bumpUsage(by = 1) {
  write(USAGE_KEY, { date: today(), count: getUsage() + by });
}

async function request(path, params, signal) {
  if (!HAS_KEY) throw new RecipeApiError('key', 'Brak klucza API Spoonacular');
  if (getUsage() >= DAILY_LIMIT) throw new RecipeApiError('limit', 'Dzienny limit zapytań został wykorzystany');

  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, 15000);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener('abort', onAbort);

  const qs = new URLSearchParams({ ...params, apiKey: KEY });
  try {
    const res = await fetch(`${BASE}${path}?${qs}`, { signal: ctrl.signal });
    bumpUsage();
    if (res.status === 401 || res.status === 403) throw new RecipeApiError('key', 'Klucz API jest nieprawidłowy');
    if (res.status === 402 || res.status === 429) {
      write(USAGE_KEY, { date: today(), count: DAILY_LIMIT }); // serwer mówi dość, blokujemy do jutra
      throw new RecipeApiError('quota', 'Limit zapytań Spoonacular został wyczerpany');
    }
    if (!res.ok) throw new RecipeApiError('http', `Spoonacular: HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err instanceof RecipeApiError) throw err;
    if (signal?.aborted) throw err;
    if (timedOut) throw new RecipeApiError('timeout', 'Spoonacular nie odpowiada');
    throw new RecipeApiError('offline', 'Brak połączenia ze Spoonacular');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

/* ---------- normalizacja odpowiedzi ---------- */

// Składnik z findByIngredients: zostawiamy tylko to, co potrzebne
function mapListIngredient(i, usedByApi) {
  return { name: i.name, amount: i.amount, unit: i.unitShort || i.unit || '', usedByApi };
}

function mapListRecipe(x) {
  return {
    id: x.id,
    source: 'spoonacular',
    title: x.title,
    image: x.image || '',
    ingredients: [
      ...(x.usedIngredients ?? []).map((i) => mapListIngredient(i, true)),
      ...(x.missedIngredients ?? []).map((i) => mapListIngredient(i, false)),
    ],
    detailsLoaded: false,
  };
}

const stripHtml = (s) => String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function nutrient(info, name) {
  return info.nutrition?.nutrients?.find((n) => n.name === name)?.amount;
}

/*
  Pełny przepis z /recipes/{id}/information -> nasz kształt.
  Zawiera też pola, których oczekuje moduł makro (Maks): categories, ingredientsCount, stepsCount, nutrition na porcję
  (patrz features/makro/sampleRecipes.js), więc normalizeRecipe może zasilić jego widok zamiast przykładów.
*/
export function normalizeRecipe(info) {
  const steps = (info.analyzedInstructions ?? []).flatMap((g) => g.steps ?? []).map((s) => stripHtml(s.step)).filter(Boolean);
  const fallbackSteps = steps.length ? steps : stripHtml(info.instructions).split(/(?<=\.)\s+/).filter(Boolean);
  const ingredients = (info.extendedIngredients ?? []).map((i) => {
    const metric = i.measures?.metric;
    const useMetric = metric && metric.unitShort && ['g', 'ml', 'kg', 'l'].includes(String(metric.unitShort).toLowerCase());
    return {
      name: i.nameClean || i.name,
      amount: useMetric ? metric.amount : i.amount,
      unit: useMetric ? metric.unitShort : i.unit,
      original: i.original,
    };
  });
  const kcal = nutrient(info, 'Calories');
  return {
    id: info.id,
    source: 'spoonacular',
    title: info.title,
    image: info.image || '',
    readyInMinutes: info.readyInMinutes,
    servings: info.servings,
    ingredients,
    steps: fallbackSteps,
    categories: categoriesFromDishTypes(info.dishTypes),
    ingredientsCount: ingredients.length,
    stepsCount: fallbackSteps.length,
    nutrition:
      kcal === undefined
        ? null
        : {
            kcal: Math.round(kcal),
            protein: Math.round(nutrient(info, 'Protein') ?? 0),
            fat: Math.round(nutrient(info, 'Fat') ?? 0),
            carbs: Math.round(nutrient(info, 'Carbohydrates') ?? 0),
          },
    detailsLoaded: true,
  };
}

/* ---------- publiczne funkcje ---------- */

// Przepisy pasujące do składników. names = angielskie nazwy po przecinku. Zwraca { recipes, cached }.
export async function findByIngredients(names, { signal, force = false } = {}) {
  const key = [...names].sort().join(',');
  const cache = read(SUGGEST_KEY, null);
  if (!force && cache && cache.key === key && Date.now() - cache.at < SUGGEST_TTL) {
    return { recipes: cache.recipes, cached: true, at: cache.at };
  }
  const data = await request(
    '/recipes/findByIngredients',
    { ingredients: names.join(','), number: 24, ranking: 2, ignorePantry: true },
    signal,
  );
  // tytuły i nazwy składników po polsku (gdy tłumaczenie zawiedzie, zostaje angielski)
  const recipes = await localizeList(data.map(mapListRecipe), { signal }).catch(() => data.map(mapListRecipe));
  const at = Date.now();
  write(SUGGEST_KEY, { key, at, recipes });
  return { recipes, cached: false, at };
}

export function getCachedSuggestions(names) {
  const key = [...names].sort().join(',');
  const cache = read(SUGGEST_KEY, null);
  return cache && cache.key === key && Date.now() - cache.at < SUGGEST_TTL ? cache : null;
}

export function getCachedDetails(id) {
  return read(DETAILS_KEY, {})[id] ?? null;
}

export async function fetchRecipeDetails(id, { signal } = {}) {
  const cached = getCachedDetails(id);
  if (cached) return cached.recipe;
  const info = await request(`/recipes/${id}/information`, { includeNutrition: true }, signal);
  const recipe = await localizeRecipe(normalizeRecipe(info), { signal }).catch(() => normalizeRecipe(info));
  // cache szczegółów na stałe, ale z limitem liczby wpisów (najstarsze wypadają)
  const all = read(DETAILS_KEY, {});
  all[id] = { at: Date.now(), recipe };
  const entries = Object.entries(all).sort((a, b) => b[1].at - a[1].at).slice(0, MAX_DETAILS);
  write(DETAILS_KEY, Object.fromEntries(entries));
  return recipe;
}
