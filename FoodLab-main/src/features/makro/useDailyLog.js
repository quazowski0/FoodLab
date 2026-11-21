import { useLocalStorage, dateKey } from './storage.js';
import { sumMeals } from './nutrition.js';

const WEEKDAYS = ['nd', 'pn', 'wt', 'śr', 'czw', 'pt', 'sb'];

// Dziennik posiłków: { "2026-11-14": [ { id, slot, title, portions, at, kcal, protein, fat, carbs } ] }
// Każdy dzień ma własny klucz, więc nowy dzień zaczyna się pusty, a historia zostaje.
export function useDailyLog() {
  const [log, setLog] = useLocalStorage('foodlab.dziennik', {});
  const today = dateKey();
  const meals = Array.isArray(log[today]) ? log[today] : [];

  const addMeal = (meal) =>
    setLog((prev) => ({ ...prev, [today]: [...(prev[today] ?? []), meal] }));

  const removeMeal = (id) =>
    setLog((prev) => ({ ...prev, [today]: (prev[today] ?? []).filter((m) => m.id !== id) }));

  const lastDays = (count = 7) =>
    Array.from({ length: count }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (count - 1 - i));
      const key = dateKey(d);
      return {
        key,
        label: i === count - 1 ? 'dziś' : WEEKDAYS[d.getDay()],
        kcal: sumMeals(Array.isArray(log[key]) ? log[key] : []).kcal,
      };
    });

  return { meals, addMeal, removeMeal, lastDays };
}
