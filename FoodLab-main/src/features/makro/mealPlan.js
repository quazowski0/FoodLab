// Pory posiłków i podział dziennych kalorii (procent celu)
export const SLOTS = {
  sn: { name: 'Śniadanie', hour: 7 },
  sn2: { name: 'II śniadanie', hour: 10 },
  ob: { name: 'Obiad', hour: 13 },
  pod: { name: 'Podwieczorek', hour: 16 },
  kol: { name: 'Kolacja', hour: 19 },
  prz: { name: 'Przekąska wieczorna', hour: 21 },
};

export const MEAL_PLANS = {
  3: [['sn', 30], ['ob', 40], ['kol', 30]],
  4: [['sn', 25], ['ob', 35], ['pod', 15], ['kol', 25]],
  5: [['sn', 25], ['sn2', 10], ['ob', 35], ['pod', 10], ['kol', 20]],
  6: [['sn', 20], ['sn2', 10], ['ob', 30], ['pod', 10], ['kol', 20], ['prz', 10]],
};

export const MEAL_COUNT_OPTIONS = [
  { value: 3, label: '3: śniadanie, obiad, kolacja' },
  { value: 4, label: '4: plus podwieczorek' },
  { value: 5, label: '5: plus II śniadanie' },
  { value: 6, label: '6: plus przekąska wieczorna' },
];

export function buildPlan(goalKcal, mealCount) {
  const plan = MEAL_PLANS[mealCount] ?? MEAL_PLANS[5];
  return plan.map(([key, pct]) => ({ key, pct, name: SLOTS[key].name, target: Math.round((goalKcal * pct) / 100) }));
}

// Posiłek z pory, której nie ma w obecnym planie (np. po zmianie 5 na 3), trafia do najbliższej godzinowo
export function slotOf(meal, plan) {
  if (plan.some((s) => s.key === meal.slot)) return meal.slot;
  const hour = SLOTS[meal.slot]?.hour ?? (parseInt(meal.at, 10) || 12);
  return [...plan].sort((a, b) => Math.abs(SLOTS[a.key].hour - hour) - Math.abs(SLOTS[b.key].hour - hour))[0].key;
}

export function emptySlots(meals, plan) {
  const used = new Set(meals.map((m) => slotOf(m, plan)));
  return plan.filter((s) => !used.has(s.key));
}

// Limit na najbliższy posiłek: pozostałe kalorie dzielone proporcjonalnie na pory, które jeszcze zostały
export function nextBudget(meals, plan, remainingKcal) {
  const rem = Math.max(remainingKcal, 0);
  const empty = emptySlots(meals, plan);
  if (!empty.length) return { slot: null, kcal: rem };
  const sumPct = empty.reduce((acc, s) => acc + s.pct, 0);
  return { slot: empty[0], kcal: Math.round((rem * empty[0].pct) / sumPct) };
}

// Limit dla konkretnej pory: jeśli jest jeszcze pusta, dostaje proporcjonalną część pozostałych kalorii,
// jeśli coś już w niej zjedzono, zostaje różnica do jej celu (ale nie więcej niż reszta dnia).
export function slotBudget(slotKey, meals, plan, remainingKcal) {
  const rem = Math.max(remainingKcal, 0);
  const slot = plan.find((s) => s.key === slotKey);
  if (!slot) return { slot: null, kcal: rem };
  const empty = emptySlots(meals, plan);
  if (empty.some((s) => s.key === slotKey)) {
    const sumPct = empty.reduce((acc, s) => acc + s.pct, 0);
    return { slot, kcal: Math.round((rem * slot.pct) / sumPct) };
  }
  const eaten = meals.filter((m) => slotOf(m, plan) === slotKey).reduce((acc, m) => acc + m.kcal, 0);
  return { slot, kcal: Math.min(Math.max(slot.target - eaten, 0), rem) };
}

// Pora, do której pasuje kategoria: najpierw pusta pora z tej kategorii, potem dowolna z tej kategorii
export function slotForCategory(categoryId, slotToCategory, meals, plan, fallbackKey) {
  const matching = plan.filter((s) => slotToCategory[s.key] === categoryId);
  if (!matching.length) return fallbackKey;
  const empty = new Set(emptySlots(meals, plan).map((s) => s.key));
  return (matching.find((s) => empty.has(s.key)) ?? matching[0]).key;
}
