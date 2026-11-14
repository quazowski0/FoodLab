// Publiczne API modułu Spiżarnia. Inne moduły importują tylko stąd:
//   import { usePantry } from '../features/spizarnia';
export { default as PantryProvider } from './PantryProvider.jsx';
export { usePantry } from './pantryContext.js';
export {
  STORAGE_KEY,
  UNITS,
  availableItems,
  expiryStatus,
  expiryLabel,
  hasIngredient,
  ingredientNames,
} from './pantryStore.js';
