// Publiczne API modułu Baza produktów (Michał).
// Inne moduły importują tylko stąd: import { searchProducts } from '../features/baza';
export { searchProducts, fetchByBarcode, mapProduct, mapNutrition, ApiError } from './openFoodFacts.js';
export { useCustomProducts, CUSTOM_KEY } from './customProducts.js';
export { toPantryItem } from './pantryBridge.js';
