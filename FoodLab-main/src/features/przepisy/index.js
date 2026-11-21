// Publiczne API modułu Przepisy i lista zakupów (Krzysiek).
// Moduł makro (Maks) może zasilić swoje widoki prawdziwymi przepisami: import { normalizeRecipe } from '../features/przepisy';
export { analyzeRecipe, matchIngredient, rankRecipes, tokens } from './ingredients.js';
export { normalizeRecipe, HAS_KEY } from './spoonacular.js';
export { useShoppingList, SHOPPING_KEY } from './shoppingList.js';
