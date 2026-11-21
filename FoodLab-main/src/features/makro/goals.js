// Dzienne zapotrzebowanie ze wzoru Mifflina-St Jeora
export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Siedzący tryb, brak treningów' },
  { value: 1.375, label: 'Lekka, 1-3 treningi w tygodniu' },
  { value: 1.55, label: 'Umiarkowana, 3-5 treningów' },
  { value: 1.725, label: 'Duża, codzienne treningi' },
];

export const GOAL_TYPES = [
  { value: 'lose', label: 'Schudnąć', delta: -400, proteinPerKg: 2.0 },
  { value: 'keep', label: 'Utrzymać wagę', delta: 0, proteinPerKg: 1.6 },
  { value: 'gain', label: 'Przytyć', delta: 300, proteinPerKg: 1.8 },
];

export const DEFAULT_PROFILE = {
  sex: 'm',
  age: 20,
  weight: 70,
  height: 175,
  activity: 1.375,
  goal: 'keep',
  meals: 5,
};

const FAT_SHARE = 0.25; // 25% kalorii z tłuszczu, reszta po białku to węglowodany

function num(value, min, max, fallback) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
}

export function calcGoals(profile) {
  const age = num(profile.age, 14, 90, DEFAULT_PROFILE.age);
  const weight = num(profile.weight, 35, 200, DEFAULT_PROFILE.weight);
  const height = num(profile.height, 130, 220, DEFAULT_PROFILE.height);
  const activity = num(profile.activity, 1.2, 1.725, DEFAULT_PROFILE.activity);
  const goal = GOAL_TYPES.find((g) => g.value === profile.goal) ?? GOAL_TYPES[1];

  const bmr = 10 * weight + 6.25 * height - 5 * age + (profile.sex === 'k' ? -161 : 5);
  const tdee = bmr * activity;
  const kcal = Math.round((tdee + goal.delta) / 10) * 10;
  const protein = Math.round(goal.proteinPerKg * weight);
  const fat = Math.round((kcal * FAT_SHARE) / 9);
  const carbs = Math.max(Math.round((kcal - protein * 4 - fat * 9) / 4), 0);

  return { kcal, protein, fat, carbs, bmr, tdee, delta: goal.delta, proteinPerKg: goal.proteinPerKg, age, weight, height, activity };
}
