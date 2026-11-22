// Publiczne API modułu Baza produktów (Michał).
// Inne moduły importują tylko stąd: import { searchProducts } from '../features/baza';
export { searchProducts, fetchByBarcode, mapProduct, mapNutrition, ApiError } from './openFoodFacts.js';
export { useCustomProducts, CUSTOM_KEY } from './customProducts.js';
export { toPantryItem } from './pantryBridge.js';
export { BASIC_PRODUCTS, searchBasic } from './basicProducts.js';
export { productImage } from './productImages.js';
export { default as Thumb } from './components/Thumb.jsx';
