/* =========================================================
   Spoonacular: klient API z oszczędzaniem darmowego limitu.
   - klucz z VITE_SPOONACULAR_KEY (plik .env.local, patrz .env.example),
   - cache odpowiedzi w localStorage (lista propozycji 12 h, szczegóły przepisu na stałe),
   - licznik zapytań z dnia i twardy bezpiecznik DAILY_LIMIT.
   ========================================================= */
import { categoriesFromDishTypes } from '../makro/categories.js';
import { localizeList, localizeRecipe, translateMany } from './translate.js';

const BASE = 'https://api.spoonacular.com';
const KEY = import.meta.env.VITE_SPOONACULAR_KEY;
export const HAS_KEY = Boolean(KEY);

export const DAILY_LIMIT = 100; // zapytań na dobę, darmowy plan ma 150 punktów, więc zostaje zapas
const SUGGEST_TTL = 48 * 60 * 60 * 1000; // propozycje ważne 2 dni: oszczędzamy darmowy limit
const SUGGEST_ENTRIES = 4; // pamiętamy wyniki dla kilku ostatnich składów spiżarni
const MAX_DETAILS = 40;

const USAGE_KEY = 'foodlab.przepisy.uzycie';
const SUGGEST_KEY = 'foodlab.przepisy.propozycje.v3'; // v3: complexSearch z rodzajem dania i makro
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

/*
  findByIngredients nie zwraca rodzaju dania, a przy małej spiżarni (np. same jajka) Spoonacular
  podsuwa głównie ciasta i desery, bo mają mało składników. Desery rozpoznajemy po angielskim tytule
  i domyślnie chowamy je w widoku (przycisk "Pokaż desery").
*/
const DESSERT_RE = /\b(cakes?|cupcakes?|cookies?|biscuits?|muffins?|brownies?|blondies?|puddings?|custards?|flans?|mousse|fudge|frosting|icing|ice cream|gelato|sorbet|jam|jelly|marmalade|cobbler|crumble|panna cotta|cheesecakes?|madeleines?|mooncakes?|moon cakes?|lemon bars?|dutch baby|cinnamon twists?|fruit crepes?|tiramisu|macarons?|macaroons?|meringues?|caramels?|banana bread|danish|waffle mix|pancake mix|waffle mix|brown sugar|pop tarts?|candied|praline|toffee|brittle|truffles?|cand(y|ies)|donuts?|doughnuts?|scones?|smoothies?|milkshakes?|latte|cocoa|hot chocolate|eggnog|souffl[eé]|br[uû]l[eé]e|parfait|popsicles?|desserts?|caramel|chocolate|sweet rolls?|cinnamon rolls?|frappe|lemonade|fritters?|shortbread|snickerdoodles?)\b/i;
const NOT_DESSERT_RE = /\b(yorkshire|black pudding|savou?ry|cheese scones?|corn fritters?|zucchini fritters?)\b/i; // wytrawne mimo "deserowych" słów
export const isDessertTitle = (title) => DESSERT_RE.test(String(title ?? '')) && !NOT_DESSERT_RE.test(String(title ?? ''));

function mapListRecipe(x) {
  return {
    id: x.id,
    dessert: isDessertTitle(x.title),
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
  Kroki z analyzedInstructions: tekst (°F zamienione na °C, cale na cm), czas kroku, temperatura i sprzęt.
  Zwraca { texts: [...], meta: [{ minutes, tempC, equipment: [angielskie nazwy] }] }.
*/
const toC = (f) => Math.round(((f - 32) * 5) / 9 / 10) * 10; // jak na pokrętle piekarnika: 350°F -> 180°C
const F_RE = /(\d{3})\s*(?:°|º|degrees?|deg\.?)?\s*(?:F\b|fahrenheit)/gi;
export function metricText(text) {
  return String(text)
    .replace(F_RE, (_, f) => `${toC(Number(f))}°C`)
    .replace(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)[\s-]*inch(?:es)?\b/gi, (_, a, b) => `${Math.round(a * 2.54)}x${Math.round(b * 2.54)} cm`)
    .replace(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)[\s-]*inch(?:es)?\b/gi, (_, a, b) => `${Math.round(a * 2.54)}-${Math.round(b * 2.54)} cm`)
    .replace(/(\d+(?:\.\d+)?)[\s-]*inch(?:es)?\b/gi, (_, a) => `${Math.round(a * 2.54)} cm`);
}
function stepMinutes(st) {
  const l = st.length;
  if (!l?.number) return null;
  return /hour/i.test(l.unit) ? l.number * 60 : l.number;
}
function stepTemp(st, text) {
  const t = (st.equipment ?? []).find((e) => e.temperature?.number)?.temperature;
  if (t) return /c/i.test(t.unit) && !/f/i.test(t.unit) ? Math.round(t.number) : toC(t.number);
  const m = /(\d{2,3})°C/.exec(text);
  return m ? Number(m[1]) : null;
}
export function parseSteps(analyzedInstructions) {
  const raw = (analyzedInstructions ?? []).flatMap((g) => g.steps ?? []).filter((st) => stripHtml(st.step));
  const texts = raw.map((st) => metricText(stripHtml(st.step)));
  const meta = raw.map((st, i) => ({
    minutes: stepMinutes(st),
    tempC: stepTemp(st, texts[i]),
    equipment: [...new Set((st.equipment ?? []).map((e) => e.name).filter(Boolean))],
  }));
  return { texts, meta };
}

// Tłumaczy nazwy sprzętu w meta kroków (piekarnik, patelnia...)
export async function localizeMeta(meta, { signal } = {}) {
  const names = [...new Set(meta.flatMap((m) => m.equipment))];
  if (!names.length) return meta;
  const map = await translateMany(names, { signal }).catch(() => new Map());
  return meta.map((m) => ({ ...m, equipment: m.equipment.map((e) => (map.get(e) ?? e).toLowerCase()) }));
}

/*
  Pełny przepis z /recipes/{id}/information -> nasz kształt.
  Zawiera też pola, których oczekuje moduł makro (Maks): categories, ingredientsCount, stepsCount, nutrition na porcję
  (patrz features/makro/sampleRecipes.js), więc normalizeRecipe może zasilić jego widok zamiast przykładów.
*/
export function normalizeRecipe(info) {
  const parsed = parseSteps(info.analyzedInstructions);
  const steps = parsed.texts;
  const fallbackSteps = steps.length ? steps : metricText(stripHtml(info.instructions)).split(/(?<=\.)\s+/).filter(Boolean);
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
    stepMeta: steps.length ? parsed.meta : [],
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

/*
  Wynik z /recipes/complexSearch (fillIngredients + addRecipeNutrition) -> kształt listy.
  Od razu ma rodzaj dania, czas, liczbę kroków i makro na porcję, więc z tej samej listy korzysta
  moduł makro (Maks) bez dodatkowych zapytań.
*/
function mapSearchRecipe(x) {
  const base = mapListRecipe(x);
  const kcal = nutrient(x, 'Calories');
  const { texts: stepsEn, meta: stepMeta } = parseSteps(x.analyzedInstructions);
  const stepsCount = stepsEn.length;
  const dishTypes = x.dishTypes ?? [];
  return {
    ...base,
    dessert: dishTypes.includes('dessert') || base.dessert,
    readyInMinutes: x.readyInMinutes,
    servings: x.servings,
    categories: categoriesFromDishTypes(dishTypes),
    ingredientsCount: base.ingredients.length,
    stepsCount,
    stepMeta,
    stepsEn, // instrukcja jest już w wyniku wyszukiwania: szczegóły nie potrzebują osobnego zapytania
    sourceUrl: x.sourceUrl || '',
    nutrition:
      kcal === undefined
        ? null
        : {
            kcal: Math.round(kcal),
            protein: Math.round(nutrient(x, 'Protein') ?? 0),
            fat: Math.round(nutrient(x, 'Fat') ?? 0),
            carbs: Math.round(nutrient(x, 'Carbohydrates') ?? 0),
          },
  };
}

/*
  Szukamy osobno dań głównych, śniadań i zup/sałatek. Sam findByIngredients nie zna rodzaju dania
  i przy małej spiżarni zwracał prawie same ciasta i słodycze.
  includeIngredients + sort=max-used-ingredients: najpierw przepisy z największą liczbą Twoich produktów.
*/
const SEARCH_TYPES = [
  { type: 'main course', number: 20 },
  { type: 'breakfast', number: 10 },
  { type: 'soup', number: 5 },
  { type: 'salad', number: 5 },
];

async function searchType(names, type, number, signal) {
  const data = await request(
    '/recipes/complexSearch',
    {
      includeIngredients: names.join(','),
      type,
      number,
      sort: 'max-used-ingredients',
      fillIngredients: true,
      addRecipeNutrition: true,
      instructionsRequired: true,
      ignorePantry: true,
    },
    signal,
  );
  return data.results ?? [];
}

// Przepisy pasujące do składników. names = angielskie nazwy (najpierw te, którym kończy się ważność). Zwraca { recipes, cached }.
// Cache propozycji: kilka ostatnich wyszukiwań (stary format v3 to jeden wpis { key, at, recipes })
function readEntries() {
  const raw = read(SUGGEST_KEY, null);
  const list = Array.isArray(raw?.entries) ? raw.entries : raw?.recipes ? [raw] : [];
  return list.filter((e) => e && Array.isArray(e.recipes)).sort((a, b) => b.at - a.at);
}
function findEntry(key) {
  return readEntries().find((e) => e.key === key && Date.now() - e.at < SUGGEST_TTL) ?? null;
}
function saveEntry(entry) {
  const rest = readEntries().filter((e) => e.key !== entry.key);
  write(SUGGEST_KEY, { entries: [entry, ...rest].slice(0, SUGGEST_ENTRIES) });
}

export async function findByIngredients(names, { signal, force = false } = {}) {
  const key = [...names].sort().join(',');
  const cache = findEntry(key);
  if (!force && cache) return { recipes: markDesserts(cache.recipes), cached: true, at: cache.at };
  const settled = await Promise.allSettled(SEARCH_TYPES.map((t) => searchType(names, t.type, t.number, signal)));
  if (settled.every((r) => r.status === 'rejected')) throw settled[0].reason;
  const seen = new Set();
  const raw = settled
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((x) => (seen.has(x.id) ? false : seen.add(x.id)));
  const mapped = markDesserts(raw.map(mapSearchRecipe));
  // tytuły i nazwy składników po polsku (gdy tłumaczenie zawiedzie, zostaje angielski)
  const recipes = await localizeList(mapped, { signal }).catch(() => mapped);
  const at = Date.now();
  saveEntry({ key, at, recipes });
  return { recipes, cached: false, at };
}

// Ostatnie pobrane propozycje, niezależnie od składu spiżarni (dla modułu makro)
export function getLatestSuggestions() {
  return markDesserts(readEntries()[0]?.recipes ?? []);
}

// desery liczymy też przy odczycie z cache, żeby poprawki listy DESSERT_RE działały bez nowego zapytania
const markDesserts = (recipes) => recipes.map((r) => (r.dessert || !isDessertTitle(r.titleEn ?? r.title) ? r : { ...r, dessert: true, categories: ['desery'] }));

export function getCachedSuggestions(names) {
  const key = [...names].sort().join(',');
  const cache = findEntry(key);
  return cache ? { ...cache, recipes: markDesserts(cache.recipes) } : null;
}

// Przepisy, które użytkownik już otworzył (szczegóły w cache), z kaloriami na porcję.
// Moduł makro (Maks) pokazuje je obok przykładów bez dodatkowych zapytań do API.
export function getCachedRecipes() {
  return Object.values(read(DETAILS_KEY, {}))
    .sort((a, b) => b.at - a.at)
    .map((x) => x.recipe)
    .filter((r) => r?.nutrition && r.title);
}

export function getCachedDetails(id) {
  return read(DETAILS_KEY, {})[id] ?? null;
}

// Link do przepisu na stronie Spoonacular (gdy limit zapytań się skończył)
export function recipeUrl(recipe) {
  if (recipe.sourceUrl) return recipe.sourceUrl;
  const slug = String(recipe.titleEn ?? recipe.title ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `https://spoonacular.com/recipes/${slug}-${recipe.id}`;
}

export async function fetchRecipeDetails(id, { signal, base } = {}) {
  const cached = getCachedDetails(id);
  if (cached) return cached.recipe;
  // propozycja z complexSearch ma już kroki po angielsku: tłumaczymy je i nie zużywamy limitu
  if (base?.stepsEn?.length) {
    const [map, stepMeta] = await Promise.all([
      translateMany(base.stepsEn, { signal }).catch(() => new Map()),
      localizeMeta(base.stepMeta ?? [], { signal }),
    ]);
    const pl = (t) => map.get(t.replace(/\s+/g, ' ').trim()) ?? t;
    return { ...base, steps: base.stepsEn.map(pl), stepMeta, detailsLoaded: true, stepsTranslated: map.size > 0, translated: base.translated || map.size > 0 };
  }
  const info = await request(`/recipes/${id}/information`, { includeNutrition: true }, signal);
  const norm = normalizeRecipe(info);
  const [localized, stepMeta] = await Promise.all([
    localizeRecipe(norm, { signal }).catch(() => norm),
    localizeMeta(norm.stepMeta, { signal }),
  ]);
  const recipe = { ...localized, stepMeta };
  // cache szczegółów na stałe, ale z limitem liczby wpisów (najstarsze wypadają)
  const all = read(DETAILS_KEY, {});
  all[id] = { at: Date.now(), recipe };
  const entries = Object.entries(all).sort((a, b) => b[1].at - a[1].at).slice(0, MAX_DETAILS);
  write(DETAILS_KEY, Object.fromEntries(entries));
  return recipe;
}
