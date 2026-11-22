/* =========================================================
   Tłumaczenie treści ze Spoonacular (EN -> PL).
   Używa darmowego, nieoficjalnego endpointu Google Translate (bez klucza). Działa "best effort":
   gdy się nie uda (brak internetu, zmiana endpointu), zostaje angielski tekst i aplikacja działa dalej.
   Przetłumaczone frazy zapisujemy w localStorage, żeby nie pytać dwa razy o to samo.
   ========================================================= */

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pl&dt=t';
const CACHE_KEY = 'foodlab.przepisy.tlumaczenia';
const MAX_CACHE = 2000;
const CHUNK_CHARS = 3500;
const CHUNK_ITEMS = 50;

function loadCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}
function saveCache(cache) {
  const entries = Object.entries(cache);
  const trimmed = entries.length > MAX_CACHE ? Object.fromEntries(entries.slice(-MAX_CACHE)) : cache;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    /* brak miejsca albo zablokowany localStorage: tłumaczymy bez cache */
  }
}

async function post(text, signal) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch(ENDPOINT, { method: 'POST', body: new URLSearchParams({ q: text }), signal: ctrl.signal });
    if (!res.ok) throw new Error(`translate: HTTP ${res.status}`);
    const data = await res.json();
    return (data?.[0] ?? []).map((seg) => seg?.[0] ?? '').join('');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

// Dzieli listę na paczki, żeby zapytania nie były za długie
function chunks(list) {
  const out = [];
  let cur = [];
  let chars = 0;
  for (const t of list) {
    if (cur.length && (cur.length >= CHUNK_ITEMS || chars + t.length > CHUNK_CHARS)) {
      out.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(t);
    chars += t.length + 1;
  }
  if (cur.length) out.push(cur);
  return out;
}

/*
  translateMany(['egg', 'Mix well.']) -> Map { 'egg' => 'jajko', ... }
  Frazy, których nie udało się przetłumaczyć, po prostu nie ma w mapie.
*/
export async function translateMany(texts, { signal } = {}) {
  const cache = loadCache();
  const result = new Map();
  const todo = [];
  for (const raw of new Set(texts.map((t) => String(t ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean))) {
    if (cache[raw]) result.set(raw, cache[raw]);
    else todo.push(raw);
  }

  for (const chunk of chunks(todo)) {
    try {
      // paczka połączona znakami nowej linii; gdy liczba linii się nie zgadza, tłumaczymy po jednej
      const joined = (await post(chunk.join('\n'), signal)).split('\n').map((s) => s.trim());
      const parts = joined.length === chunk.length ? joined : await Promise.all(chunk.map((t) => post(t, signal).catch(() => '')));
      chunk.forEach((t, i) => {
        if (parts[i]) {
          result.set(t, parts[i]);
          cache[t] = parts[i];
        }
      });
    } catch {
      if (signal?.aborted) break;
      /* ta paczka zostaje po angielsku */
    }
  }
  saveCache(cache);
  return result;
}

const clean = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();
const cap = (t) => String(t).charAt(0).toUpperCase() + String(t).slice(1);
// słowa, które tłumacz przekłada źle (cheesy -> "tandetny"), zamieniamy przed tłumaczeniem
const fixTitle = (t) => String(t ?? '').replace(/\bcheesy\b/gi, 'cheese').replace(/\bpop tarts?\b/gi, 'pop-tart');

/*
  Zwraca kopię przepisu po polsku. Oryginalne angielskie nazwy składników trzymamy w nameEn,
  bo na nich też opiera się dopasowanie do spiżarni (patrz ingredients.js).
*/
export async function localizeRecipe(recipe, { signal } = {}) {
  const map = await translateMany(
    [fixTitle(recipe.title), ...recipe.ingredients.map((i) => i.name), ...(recipe.steps ?? [])],
    { signal },
  );
  const pl = (t) => map.get(clean(t)) ?? t;
  return {
    ...recipe,
    title: cap(pl(fixTitle(recipe.title))),
    titleEn: recipe.title,
    ingredients: recipe.ingredients.map((i) => ({ ...i, name: pl(i.name), nameEn: i.name })),
    steps: recipe.steps?.map(pl),
    translated: map.size > 0,
  };
}

// To samo dla całej listy propozycji jedną paczką (tytuły i nazwy składników)
export async function localizeList(recipes, { signal } = {}) {
  const map = await translateMany(
    recipes.flatMap((r) => [fixTitle(r.title), ...r.ingredients.map((i) => i.name)]),
    { signal },
  );
  const pl = (t) => map.get(clean(t)) ?? t;
  return recipes.map((r) => ({
    ...r,
    title: cap(pl(fixTitle(r.title))),
    titleEn: r.title,
    ingredients: r.ingredients.map((i) => ({ ...i, name: pl(i.name), nameEn: i.name })),
    translated: map.size > 0,
  }));
}
