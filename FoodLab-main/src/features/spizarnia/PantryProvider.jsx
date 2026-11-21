import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { PantryContext } from './pantryContext.js';
import {
  STORAGE_KEY,
  availableItems,
  hasIngredient,
  ingredientNames,
  loadPantry,
  pantryReducer,
  savePantry,
} from './pantryStore.js';

// Globalny stan spiżarni: React Context + useReducer, zapis w localStorage.
// Owija całą aplikację w src/App.jsx, dzięki czemu każdy moduł może wywołać usePantry().
export default function PantryProvider({ children }) {
  const [items, dispatch] = useReducer(pantryReducer, undefined, loadPantry);

  // każda zmiana od razu do localStorage
  useEffect(() => {
    savePantry(items);
  }, [items]);

  // zmiana w innej karcie przeglądarki: wczytujemy nowy stan
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) dispatch({ type: 'replace', items: loadPantry() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((item) => dispatch({ type: 'add', item }), []);
  const updateItem = useCallback((id, changes) => dispatch({ type: 'update', id, changes }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'remove', id }), []);
  const changeQuantity = useCallback((id, delta) => dispatch({ type: 'changeQuantity', id, delta }), []);
  const restoreItem = useCallback((item, index) => dispatch({ type: 'restore', item, index }), []);
  const removeExpired = useCallback(() => dispatch({ type: 'removeExpired' }), []);

  const value = useMemo(
    () => ({
      items,
      available: availableItems(items),
      addItem,
      updateItem,
      removeItem,
      changeQuantity,
      restoreItem,
      removeExpired,
      hasIngredient: (name) => hasIngredient(items, name),
      ingredientNames: (options) => ingredientNames(items, options),
    }),
    [items, addItem, updateItem, removeItem, changeQuantity, restoreItem, removeExpired],
  );

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}
