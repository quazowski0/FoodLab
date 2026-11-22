/* =========================================================
   Przepisy (Krzysiek): porównywanie składników przepisu ze spiżarnią.
   Bez Reacta, więc łatwo to testować. Najtrudniejsza część modułu:
   - nazwy: po polsku i po angielsku ("mleko 2%" = "milk", "jajka" = "eggs"),
   - jednostki: g/kg/oz/lb, ml/l/cup/tbsp/tsp, sztuki. Gdy się da, porównujemy ilości,
     gdy nie (np. gramy kontra łyżki), liczy się sama obecność produktu.
   ========================================================= */

// Polski rdzeń słowa (regex po znormalizowanym słowie) -> angielskie hasło kanoniczne
const PL_EN = [
  ['^mlek', 'milk'], ['^smietan', 'cream'], ['^maslank', 'buttermilk'], ['^jogurt', 'yogurt'], ['^kefir', 'kefir'],
  ['^maslo$|^masla$|^maslem$', 'butter'], ['^ser(a|owi|em|y|ow)?$', 'cheese'], ['^serek|^twarog|^twarozek', 'cottage'],
  ['^feta', 'feta'], ['^mozzarell', 'mozzarella'], ['^parmezan', 'parmesan'], ['^jaj', 'egg'],
  ['^kurczak|^kurcz', 'chicken'], ['^indyk', 'turkey'], ['^wieprzow', 'pork'], ['^wolowin', 'beef'], ['^szynk', 'ham'],
  ['^boczek', 'bacon'], ['^kielbas', 'sausage'], ['^ryb', 'fish'], ['^losos', 'salmon'], ['^tunczyk', 'tuna'],
  ['^mies', 'meat'], ['^mielon', 'ground'], ['^piers', 'breast'], ['^udk', 'thigh'], ['^krewetk', 'shrimp'],
  ['^pomidor', 'tomato'], ['^ogorek|^ogork', 'cucumber'], ['^cebul', 'onion'], ['^czosnek|^czosnk', 'garlic'],
  ['^marchew|^marchwi', 'carrot'], ['^ziemniak|^kartofl', 'potato'], ['^papryk', 'bell pepper'], ['^szpinak|^szpinak', 'spinach'],
  ['^salat|^salaty', 'lettuce'], ['^brokul', 'broccoli'], ['^kalafior', 'cauliflower'], ['^kapust', 'cabbage'],
  ['^cukini|^cukinia', 'zucchini'], ['^bakla[zż]an|^bakalazan', 'eggplant'], ['^dyni', 'pumpkin'], ['^seler', 'celery'],
  ['^por($|y|ow|em)', 'leek'], ['^rzodkiew', 'radish'], ['^burak', 'beet'], ['^kukurydz', 'corn'], ['^groszek|^grosz', 'pea'],
  ['^fasol', 'bean'], ['^ciecierzyc', 'chickpea'], ['^soczewic', 'lentil'], ['^grzyb|^pieczark', 'mushroom'],
  ['^szczypior', 'chive'], ['^natk', 'parsley'], ['^bazyli', 'basil'], ['^oregano', 'oregano'], ['^tymianek|^tymianku', 'thyme'],
  ['^koperek|^koper', 'dill'], ['^imbir', 'ginger'], ['^cytryn', 'lemon'], ['^limon', 'lime'], ['^pomarancz', 'orange'],
  ['^jablk', 'apple'], ['^banan', 'banana'], ['^malin', 'raspberry'], ['^truskaw', 'strawberry'], ['^boroww', 'blueberry'],
  ['^awokado', 'avocado'], ['^orzech', 'nut'], ['^migdal', 'almond'], ['^maslo orzech', 'peanut butter'],
  ['^makaron|^spaghetti|^penne', 'pasta'], ['^ryz($|u|em|e)', 'rice'], ['^kasz', 'groat'], ['^platk', 'oat'], ['^owsian', 'oat'],
  ['^maka|^make|^maki', 'flour'], ['^chleb', 'bread'], ['^bulk', 'bun'], ['^tortill', 'tortilla'], ['^bulgur', 'bulgur'],
  ['^cukier|^cukru', 'sugar'], ['^miod', 'honey'], ['^sol($|i|a)', 'salt'], ['^pieprz', 'pepper'], ['^olej|^oliw', 'oil'],
  ['^ocet|^octu', 'vinegar'], ['^musztard', 'mustard'], ['^ketchup', 'ketchup'], ['^majonez', 'mayonnaise'],
  ['^bulion|^buli', 'broth'], ['^wod', 'water'], ['^kakao', 'cocoa'], ['^czekolad', 'chocolate'], ['^proszek|^sod', 'baking'],
  ['^kokos', 'coconut'], ['^soj', 'soy'], ['^pesto', 'pesto'], ['^hummus', 'hummus'], ['^tofu', 'tofu'], ['^passat|^przecier', 'tomato'], ['^koncentrat', 'paste'],
];
const PL_EN_RE = PL_EN.map(([re, en]) => [new RegExp(re), en]);

// Angielskie odpowiedniki, które znaczą to samo
const EN_SYNONYMS = {
  spaghetti: 'pasta', penne: 'pasta', macaroni: 'pasta', fusilli: 'pasta', noodle: 'pasta', tagliatelle: 'pasta',
  yoghurt: 'yogurt', courgette: 'zucchini', aubergine: 'eggplant', coriander: 'cilantro', scallion: 'onion',
  cheddar: 'cheese', gouda: 'cheese', mince: 'ground', capsicum: 'bell pepper', rocket: 'arugula', prawn: 'shrimp',
};

// Słowa opisowe, które nie zmieniają, o jaki składnik chodzi
const STOP = new Set([
  'fresh', 'large', 'small', 'medium', 'big', 'chopped', 'sliced', 'diced', 'minced', 'grated', 'whole', 'dried', 'frozen',
  'extra', 'virgin', 'unsalted', 'boneless', 'skinless', 'cooked', 'raw', 'ripe', 'optional', 'taste', 'of', 'and', 'or', 'for',
  'finely', 'thinly', 'plain', 'natural', 'organic', 'red', 'green', 'yellow', 'white', 'the', 'a', 'to', 'into', 'pieces', 'piece',
  'z', 'i', 'w', 'na', 'do', 'oraz', 'swiezy', 'swieza', 'swieze', 'duzy', 'duza', 'maly', 'mala', 'zwykly', 'naturalny', 'naturalna',
  'pokrojony', 'startego', 'tarty', 'suszony', 'mrozony', 'gotowany', 'bio', 'wedlug', 'smaku',
]);

export function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z\s]/g, ' ') // cyfry, %, przecinki
    .replace(/\s+/g, ' ')
    .trim();
}

function singular(word) {
  if (word.length > 3 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith('oes')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) return word.slice(0, -1);
  return word;
}

// "Mleko 2%" -> Set{'milk'}, "red onions" -> Set{'onion'}, "Pierś z kurczaka" -> Set{'breast','chicken'}
export function tokens(text) {
  const out = new Set();
  for (const raw of normalize(text).split(' ')) {
    if (!raw || STOP.has(raw)) continue;
    const hit = PL_EN_RE.find(([re]) => re.test(raw));
    const base = hit ? hit[1] : singular(raw);
    for (const part of base.split(' ')) {
      const canon = EN_SYNONYMS[part] ?? part;
      for (const t of canon.split(' ')) if (t.length > 1 && !STOP.has(t)) out.add(t);
    }
  }
  return out;
}

// Podstawowe produkty zakładamy, że są w każdym domu (Spoonacular robi to samo z ignorePantry)
export function isStaple(name) {
  const t = tokens(name);
  if (!t.size) return false;
  if (t.has('salt') || t.has('water')) return !t.has('coconut');
  return [...t].every((x) => x === 'pepper' || x === 'black' || x === 'ground');
}

/* ---------- jednostki ---------- */

// Każda jednostka -> { kind: 'mass' | 'volume' | 'count', factor } (factor: ile g / ml / sztuk w jednej jednostce)
const UNIT_TABLE = {
  g: ['mass', 1], gram: ['mass', 1], grams: ['mass', 1], kg: ['mass', 1000], oz: ['mass', 28.35], ounce: ['mass', 28.35],
  ounces: ['mass', 28.35], lb: ['mass', 453.6], lbs: ['mass', 453.6], pound: ['mass', 453.6], pounds: ['mass', 453.6],
  ml: ['volume', 1], l: ['volume', 1000], cl: ['volume', 10], cup: ['volume', 240], cups: ['volume', 240],
  tbsp: ['volume', 15], tablespoon: ['volume', 15], tablespoons: ['volume', 15], tsp: ['volume', 5], teaspoon: ['volume', 5],
  teaspoons: ['volume', 5],
  szt: ['count', 1], '': ['count', 1], piece: ['count', 1], pieces: ['count', 1], large: ['count', 1], medium: ['count', 1],
  small: ['count', 1], clove: ['count', 1], cloves: ['count', 1], slice: ['count', 1], slices: ['count', 1],
};

export function toBase(amount, unit) {
  const info = UNIT_TABLE[String(unit ?? '').toLowerCase().trim()];
  const n = Number(amount);
  if (!info || !Number.isFinite(n) || n <= 0) return null;
  return { kind: info[0], factor: info[1], value: n * info[1] };
}

/* ---------- dopasowanie ---------- */

// Czy składnik przepisu (zbiór słów A) to ten sam produkt co pozycja spiżarni (zbiór B)?
// B ⊆ A: "cebula" pasuje do "red onion"; A ⊆ B: "milk" pasuje do "mleko kokosowe"? tak, ale tylko gdy A ma jedno słowo.
// Słowa, które zmieniają produkt: "coconut milk" to nie "milk", "cream cheese" to nie "cheese"
const DISTINCT = new Set([
  'coconut', 'almond', 'soy', 'peanut', 'cream', 'sour', 'cocoa', 'powder', 'sauce', 'paste', 'juice', 'broth', 'stock',
  'vinegar', 'sugar', 'cottage', 'sweet', 'hot', 'smoked', 'dark', 'baking', 'butter', 'bell',
]);

function sameProduct(a, b) {
  if (!a.size || !b.size) return false;
  const differing = [...a].filter((t) => !b.has(t)).concat([...b].filter((t) => !a.has(t)));
  if (differing.some((t) => DISTINCT.has(t))) return false;
  const subset = (x, y) => [...x].every((t) => y.has(t));
  return subset(b, a) || (a.size === 1 && subset(a, b));
}

export function pantryTokens(item) {
  return new Set([...tokens(item.name), ...tokens(item.nameEn ?? '')]);
}

/*
  Jak składnik przepisu ma się do spiżarni:
    { status: 'have' | 'partial' | 'missing' | 'staple', shortfall?: { amount, unit }, matches: [produkty] }
  ingredient = { name, amount?, unit? }, pantry = produkty dostępne (availableItems).
*/
export function matchIngredient(ingredient, pantry) {
  if (isStaple(ingredient.name)) return { status: 'staple', matches: [] };
  const a = new Set([...tokens(ingredient.name), ...tokens(ingredient.nameEn ?? '')]);
  const matches = pantry.filter((p) => sameProduct(a, pantryTokens(p)));
  if (!matches.length) return { status: 'missing', matches };

  const need = toBase(ingredient.amount, ingredient.unit);
  if (!need) return { status: 'have', matches };
  const same = matches.map((p) => toBase(p.quantity, p.unit)).filter((b) => b && b.kind === need.kind);
  // opakowania, łyżki kontra gramy itp.: nie da się porównać, więc wystarczy, że produkt jest
  if (!same.length) return { status: 'have', matches };
  const have = same.reduce((sum, b) => sum + b.value, 0);
  if (have + 1e-6 >= need.value) return { status: 'have', matches };
  const missing = (need.value - have) / need.factor;
  return {
    status: 'partial',
    shortfall: { amount: Math.round(missing * 100) / 100, unit: ingredient.unit ?? '' },
    matches,
  };
}

/*
  Analiza przepisu względem spiżarni.
  recipe.ingredients = [{ name, amount, unit, usedByApi? }], zwraca:
  { rows: [{ ingredient, status, shortfall }], haveCount, total, missingCount, missing: [...] }
  "missingCount" liczy składniki, których brakuje całkiem albo jest za mało (partial).
*/
export function analyzeRecipe(recipe, pantry) {
  const rows = recipe.ingredients.map((ingredient) => {
    const m = matchIngredient(ingredient, pantry);
    // Spoonacular sam oznaczył składnik jako użyty (np. po angielskiej nazwie z naszego zapytania)
    if (m.status === 'missing' && ingredient.usedByApi) return { ingredient, status: 'have', shortfall: null };
    return { ingredient, status: m.status, shortfall: m.shortfall ?? null };
  });
  const counted = rows.filter((r) => r.status !== 'staple');
  const missing = counted.filter((r) => r.status === 'missing' || r.status === 'partial');
  const haveCount = counted.filter((r) => r.status === 'have').length;
  return { rows, total: counted.length, haveCount, missingCount: missing.length, missing };
}

// Ile ze składników przepisu w ogóle mamy (całe lub częściowo); 0 = przepis nie pasuje
export const usedCount = (analysis) => analysis.rows.filter((r) => r.status === 'have' || r.status === 'partial').length;

// Sortowanie: najpierw przepisy bez braków, potem coraz większe braki; przy remisie ten z większym pokryciem
export function rankRecipes(items) {
  return items
    .filter((x) => usedCount(x.analysis) > 0)
    .sort(
      (a, b) =>
        a.analysis.missingCount - b.analysis.missingCount ||
        usedCount(b.analysis) - usedCount(a.analysis) ||
        a.recipe.title.localeCompare(b.recipe.title, 'pl'),
    );
}

// Zapytanie do Spoonacular: angielskie nazwy produktów (nameEn z bazy produktów albo przetłumaczone słownikiem)
export function queryName(item) {
  if (item.nameEn) return normalize(item.nameEn);
  const recognised = [...normalize(item.name).split(' ')]
    .map((w) => PL_EN_RE.find(([re]) => re.test(w))?.[1])
    .filter(Boolean);
  if (!recognised.length) return normalize(item.name);
  // po angielsku "ground beef", ale "chicken breast": kolejność ma znaczenie dla wyszukiwarki
  const words = [...new Set(recognised.flatMap((w) => w.split(' ')))];
  const rank = (w) => (w === 'ground' ? 0 : w === 'breast' || w === 'thigh' ? 2 : 1);
  return words.sort((x, y) => rank(x) - rank(y)).join(' ');
}

/* ---------- wyświetlanie ---------- */

const UNIT_LABEL = { szt: 'szt.', opak: 'opak.' };

// Amerykańskie miary ze Spoonacular po polsku: [1, 2-4 i ułamki, 5+]
const US_UNITS = [
  [/^(cups?|c)$/i, ['szklanka', 'szklanki', 'szklanek']],
  [/^(?:(?:[Tt]bsps?|[Tt]ablespoons?|[Tt]bs|TBSP|Tb)|T)$/, ['łyżka', 'łyżki', 'łyżek']],
  [/^(?:(?:[Tt]sps?|[Tt]easpoons?|TSP)|t)$/, ['łyżeczka', 'łyżeczki', 'łyżeczek']],
  [/^cloves?$/i, ['ząbek', 'ząbki', 'ząbków']],
  [/^slices?$/i, ['plaster', 'plastry', 'plastrów']],
  [/^(cans?|tins?)$/i, ['puszka', 'puszki', 'puszek']],
  [/^pinch(es)?$/i, ['szczypta', 'szczypty', 'szczypt']],
  [/^handfuls?$/i, ['garść', 'garści', 'garści']],
  [/^(packages?|pkgs?|packets?)$/i, ['opak.', 'opak.', 'opak.']],
  [/^(large|medium|small|servings?|pieces?|whole|each)$/i, ['szt.', 'szt.', 'szt.']],
];
const WEIGHT = [[/^(oz|ounces?)$/i, 28.35], [/^(lbs?|pounds?)$/i, 453.6]];
const FRACTIONS = [[0.25, '¼'], [0.33, '⅓'], [0.5, '½'], [0.67, '⅔'], [0.75, '¾']];

function niceNumber(n) {
  const whole = Math.floor(n);
  const frac = FRACTIONS.find(([f]) => Math.abs(n - whole - f) < 0.02);
  if (frac) return whole ? `${whole} ${frac[1]}` : frac[1];
  return n.toLocaleString('pl-PL', { maximumFractionDigits: 2 });
}

export function formatAmount(amount, unit) {
  const n = Number(amount);
  const has = Number.isFinite(n) && n > 0;
  const raw = String(unit ?? '').trim();
  const weight = WEIGHT.find(([re]) => re.test(raw));
  if (weight && has) {
    const g = n * weight[1];
    return g >= 1000 ? `${(g / 1000).toLocaleString('pl-PL', { maximumFractionDigits: 1 })} kg` : `${Math.round(g / 5) * 5 || Math.round(g)} g`;
  }
  const us = US_UNITS.find(([re]) => re.test(raw));
  if (us) {
    const [one, few, many] = us[1];
    const word = !has || n === 1 ? one : !Number.isInteger(n) || (n >= 2 && n <= 4) ? few : many;
    return [has ? niceNumber(n) : '', word].filter(Boolean).join(' ');
  }
  const value = has ? n.toLocaleString('pl-PL', { maximumFractionDigits: 2 }) : '';
  const u = UNIT_LABEL[unit] ?? unit ?? '';
  return [value, u].filter(Boolean).join(' ');
}

/* ---------- porcje i zużycie ---------- */

// Kopia przepisu z ilościami przeliczonymi przez factor (np. 4 porcje zamiast 2 -> factor 2)
export function scaleRecipe(recipe, factor) {
  if (!factor || factor === 1) return recipe;
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((i) => {
      const n = Number(i.amount);
      return Number.isFinite(n) && n > 0 ? { ...i, amount: Math.round(n * factor * 100) / 100 } : i;
    }),
  };
}

// Ile odjąć z pozycji spiżarni, żeby zużyć potrzebną ilość (w jednostce pozycji). null = nie da się porównać.
function usageFor(need, item) {
  const have = toBase(item.quantity, item.unit);
  if (!have) return null;
  // ml i g traktujemy zamiennie (gęstość jak woda): to tylko szacunek dla spiżarni
  const comparable = need.kind === have.kind || (need.kind !== 'count' && have.kind !== 'count');
  if (!comparable) return null;
  const used = Math.min(need.value, have.value) / have.factor;
  if (have.kind === 'count') return Math.min(item.quantity, Math.max(1, Math.round(used)));
  const step = item.unit === 'kg' || item.unit === 'l' ? 0.05 : 5;
  return Math.min(item.quantity, Math.max(step, Math.round(used / step) * step));
}

/*
  Co zużyjesz ze spiżarni, gotując przepis (recipe ma już ilości na tyle porcji, ile gotujesz).
  Zwraca [{ item, amount, ingredient }], amount w jednostce produktu ze spiżarni.
  Składniki bez ilości albo w jednostkach nie do porównania (np. "1 cebula" kontra 500 g) pomijamy.
*/
export function pantryUsage(recipe, pantry) {
  const out = new Map();
  for (const ingredient of recipe.ingredients ?? []) {
    const m = matchIngredient(ingredient, pantry);
    if (m.status !== 'have' && m.status !== 'partial') continue;
    const need = toBase(ingredient.amount, ingredient.unit);
    if (!need) continue;
    const item = [...m.matches].sort((a, b) => (a.expiry || '9999').localeCompare(b.expiry || '9999'))[0];
    const amount = usageFor(need, item);
    if (!amount || amount <= 0) continue;
    const prev = out.get(item.id);
    out.set(item.id, { item, ingredient, amount: Math.min(item.quantity, (prev?.amount ?? 0) + amount) });
  }
  return [...out.values()];
}
