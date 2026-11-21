import { proteinShare } from './nutrition.js';

export const KCAL_NO_LIMIT = 1000; // suwak na maksimum = bez limitu

export const DEFAULT_FILTERS = {
  maxKcal: KCAL_NO_LIMIT,
  difficulty: ['easy', 'mid', 'hard'],
  highProtein: false,
  fitDay: false,
  sort: 'time',
  preset: null,
};

export const SORT_OPTIONS = [
  { value: 'time', label: 'Czas' },
  { value: 'kcal', label: 'Kalorie' },
  { value: 'protein', label: 'Białko' },
  { value: 'difficulty', label: 'Trudność' },
];

// Gotowe zestawy filtrów (jedno kliknięcie zamiast kilku)
export const PRESETS = [
  { id: 'quick', label: 'Szybkie i lekkie', note: 'łatwe, do 400 kcal', set: { maxKcal: 400, difficulty: ['easy'], highProtein: false, sort: 'time' } },
  { id: 'protein', label: 'Dużo białka', note: 'min. 25% kcal z białka', set: { maxKcal: KCAL_NO_LIMIT, difficulty: ['easy', 'mid', 'hard'], highProtein: true, sort: 'protein' } },
  { id: 'dinner', label: 'Na obiad', note: 'łatwe i średnie, do 800 kcal', set: { maxKcal: 800, difficulty: ['easy', 'mid'], highProtein: false, sort: 'kcal' } },
  { id: 'weekend', label: 'Coś na weekend', note: 'tylko trudne', set: { maxKcal: KCAL_NO_LIMIT, difficulty: ['hard'], highProtein: false, sort: 'time' } },
];

const SORTERS = {
  time: (a, b) => a.readyInMinutes - b.readyInMinutes,
  kcal: (a, b) => a.nutrition.kcal - b.nutrition.kcal,
  protein: (a, b) => b.nutrition.protein - a.nutrition.protein,
  difficulty: (a, b) => a.difficulty.total - b.difficulty.total,
};

// Czysta funkcja: dostaje przepisy (z policzoną trudnością), filtry i limit kcal na porcję.
export function filterRecipes(recipes, filters, kcalLimit) {
  return recipes
    .filter((r) => r.nutrition.kcal <= kcalLimit)
    .filter((r) => filters.difficulty.includes(r.difficulty.level))
    .filter((r) => !filters.highProtein || proteinShare(r.nutrition) >= 0.25)
    .sort(SORTERS[filters.sort] ?? SORTERS.time);
}
