// Poziom trudności przepisu liczony z trzech sygnałów ze Spoonacular.
// Każdy sygnał daje 0, 1 albo 2 punkty; suma 0-1 = łatwe, 2-3 = średnie, 4+ = trudne.
export const DIFFICULTY_THRESHOLDS = {
  time: [20, 45], // readyInMinutes
  ingredients: [6, 10], // liczba składników
  steps: [5, 10], // liczba kroków instrukcji
};

export const DIFFICULTY_LABELS = { easy: 'Łatwe', mid: 'Średnie', hard: 'Trudne' };
export const DIFFICULTY_LEVELS = ['easy', 'mid', 'hard'];

const points = (value, [low, high]) => (value <= low ? 0 : value <= high ? 1 : 2);

export function getDifficulty(recipe) {
  const time = points(recipe.readyInMinutes, DIFFICULTY_THRESHOLDS.time);
  const ingredients = points(recipe.ingredientsCount, DIFFICULTY_THRESHOLDS.ingredients);
  const steps = points(recipe.stepsCount, DIFFICULTY_THRESHOLDS.steps);
  const total = time + ingredients + steps;
  const level = total <= 1 ? 'easy' : total <= 3 ? 'mid' : 'hard';
  return { level, total, time, ingredients, steps };
}
