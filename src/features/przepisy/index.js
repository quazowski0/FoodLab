// Publiczne API modułu Przepisy i lista zakupów (Krzysiek).
// Moduł makro (Maks) może zasilić swoje widoki prawdziwymi przepisami: import { normalizeRecipe } from '../features/przepisy';
export { analyzeRecipe, matchIngredient, pantryUsage, rankRecipes, scaleRecipe, tokens, formatAmount } from './ingredients.js';
export { useFavorites, FAVORITES_KEY } from './favorites.js';
export { normalizeRecipe, getCachedRecipes, getLatestSuggestions, HAS_KEY } from './spoonacular.js';
export { useShoppingList, SHOPPING_KEY } from './shoppingList.js';
