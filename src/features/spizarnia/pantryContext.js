import { createContext, useContext } from 'react';

// Sam kontekst i hook są w osobnym pliku .js, żeby PantryProvider.jsx eksportował tylko komponent
// (wymaganie reguły react-refresh w ESLint).
export const PantryContext = createContext(null);

/*
  usePantry() - wspólny stan spiżarni dla całej aplikacji.

  const { items, available, addItem, updateItem, removeItem, changeQuantity,
          restoreItem, removeExpired, hasIngredient, ingredientNames } = usePantry();
*/
export function usePantry() {
  const ctx = useContext(PantryContext);
  if (!ctx) {
    throw new Error('usePantry() musi być użyty wewnątrz <PantryProvider> (patrz src/App.jsx).');
  }
  return ctx;
}
