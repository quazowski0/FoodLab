// Pomocnicze obliczenia makroskładników (1 g białka i węglowodanów = 4 kcal, 1 g tłuszczu = 9 kcal)
export const KCAL_PER_GRAM = { protein: 4, fat: 9, carbs: 4 };
export const MACROS = [
  { key: 'protein', label: 'Białko', short: 'B' },
  { key: 'fat', label: 'Tłuszcze', short: 'T' },
  { key: 'carbs', label: 'Węglowodany', short: 'W' },
];

export function kcalShares(n) {
  const p = n.protein * KCAL_PER_GRAM.protein;
  const f = n.fat * KCAL_PER_GRAM.fat;
  const c = n.carbs * KCAL_PER_GRAM.carbs;
  const total = p + f + c || 1;
  return { protein: p / total, fat: f / total, carbs: c / total };
}

export const proteinShare = (n) => (n.protein * KCAL_PER_GRAM.protein) / (n.kcal || 1);

export function sumMeals(meals) {
  return meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      fat: acc.fat + m.fat,
      carbs: acc.carbs + m.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

export const fmt = (n) => Math.round(n).toLocaleString('pl-PL');
