// Kategorie przepisów według pory jedzenia
export const CATEGORIES = [
  { id: 'sniadanie', label: 'Śniadanie' },
  { id: 'obiad', label: 'Obiad' },
  { id: 'kolacja', label: 'Kolacja' },
  { id: 'przekaski', label: 'Przekąski' },
  { id: 'desery', label: 'Desery' },
];

// Pora posiłku z planu dnia -> kategoria, którą pokazujemy domyślnie
export const SLOT_TO_CATEGORY = { sn: 'sniadanie', sn2: 'przekaski', ob: 'obiad', pod: 'przekaski', kol: 'kolacja', prz: 'przekaski' };

// Spoonacular zwraca dishTypes, np. ["breakfast"], ["main course", "lunch"], ["snack"], ["dessert"]
const DISH_TYPE_TO_CATEGORY = {
  breakfast: 'sniadanie', morning_meal: 'sniadanie', brunch: 'sniadanie',
  'main course': 'obiad', 'main dish': 'obiad', lunch: 'obiad', soup: 'obiad',
  dinner: 'kolacja', salad: 'kolacja',
  snack: 'przekaski', appetizer: 'przekaski', fingerfood: 'przekaski', 'side dish': 'przekaski', beverage: 'przekaski',
  dessert: 'desery',
};

export function categoriesFromDishTypes(dishTypes = []) {
  const found = new Set(dishTypes.map((t) => DISH_TYPE_TO_CATEGORY[t]).filter(Boolean));
  return found.size ? [...found] : ['obiad'];
}
