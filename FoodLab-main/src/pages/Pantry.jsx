import { useEffect, useMemo, useState } from 'react';
import { usePantry } from '../features/spizarnia';
import { SORTS, expiryStatus, normalizeName, sortPantry } from '../features/spizarnia/pantryStore.js';
import PantryForm from '../features/spizarnia/components/PantryForm.jsx';
import PantryItem from '../features/spizarnia/components/PantryItem.jsx';
import BarcodeScanner from '../features/spizarnia/components/BarcodeScanner.jsx';
import '../features/spizarnia/spizarnia.css';

const SORT_KEY = 'foodlab.spizarnia.sort';

function readSort() {
  try {
    return localStorage.getItem(SORT_KEY) || 'expiry';
  } catch {
    return 'expiry';
  }
}

// Strona /spizarnia (Olek): dodawanie, edycja i usuwanie produktów
export default function Pantry() {
  const { items, addItem, updateItem, removeItem, changeQuantity, restoreItem, removeExpired } = usePantry();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(readSort);
  const [editingId, setEditingId] = useState(null);
  const [undo, setUndo] = useState(null); // ostatnio usunięty produkt, do cofnięcia
  const [scanned, setScanned] = useState({ n: 0, product: null }); // wynik skanu wpisany w formularz

  useEffect(() => {
    try {
      localStorage.setItem(SORT_KEY, sort);
    } catch {
      /* bez zapisu sortowania nic się nie dzieje */
    }
  }, [sort]);

  // komunikat "Cofnij" znika po 6 sekundach
  useEffect(() => {
    if (!undo) return undefined;
    const t = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(t);
  }, [undo]);

  const counts = useMemo(() => {
    const c = { expired: 0, soon: 0 };
    items.forEach((p) => {
      const s = expiryStatus(p.expiry);
      if (s in c) c[s] += 1;
    });
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = normalizeName(query);
    const filtered = q ? items.filter((p) => normalizeName(p.name).includes(q)) : items;
    return sortPantry(filtered, sort);
  }, [items, query, sort]);

  const remove = (item) => {
    setUndo({ item, index: items.findIndex((p) => p.id === item.id) });
    removeItem(item.id);
    if (editingId === item.id) setEditingId(null);
  };

  return (
    <div className="sp">
      <header className="sp-head">
        <h1 className="sp-title">Spiżarnia</h1>
        <p className="sp-lead">Wpisz, co masz w kuchni. Na tej podstawie podpowiemy przepisy i listę zakupów.</p>
        {items.length > 0 && (
          <ul className="sp-stats" aria-label="Podsumowanie spiżarni">
            <li><strong>{items.length}</strong> {items.length === 1 ? 'produkt' : 'produktów'}</li>
            {counts.soon > 0 && <li className="sp-stats--soon"><strong>{counts.soon}</strong> kończy się w ciągu 3 dni</li>}
            {counts.expired > 0 && <li className="sp-stats--expired"><strong>{counts.expired}</strong> po terminie</li>}
          </ul>
        )}
      </header>

      <section className="sp-panel" aria-labelledby="sp-add-title">
        <h2 className="sp-h2" id="sp-add-title">Dodaj produkt</h2>
        <BarcodeScanner onFound={(product) => setScanned((s) => ({ n: s.n + 1, product }))} />
        {/* key: po każdym skanie formularz startuje od nowa z danymi produktu */}
        <PantryForm key={scanned.n} defaults={scanned.product} onSubmit={addItem} />
      </section>

      <section className="sp-panel" aria-labelledby="sp-list-title">
        <div className="sp-toolbar">
          <h2 className="sp-h2" id="sp-list-title">Twoje zapasy</h2>
          <div className="sp-toolbar__tools">
            <input
              className="sp-input sp-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj w spiżarni"
              aria-label="Szukaj w spiżarni"
            />
            <div className="sp-seg" role="group" aria-label="Sortowanie">
              {SORTS.map((s) => (
                <button key={s.value} type="button" className="sp-seg__btn" aria-pressed={sort === s.value} onClick={() => setSort(s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {counts.expired > 0 && (
          <div className="sp-notice">
            <span>{counts.expired === 1 ? '1 produkt jest po terminie.' : `${counts.expired} produkty są po terminie.`}</span>
            <button type="button" className="sp-btn sp-btn--ghost sp-btn--sm" onClick={removeExpired}>Usuń przeterminowane</button>
          </div>
        )}

        {visible.length > 0 ? (
          <ul className="sp-list">
            {visible.map((item) => (
              <PantryItem
                key={item.id}
                item={item}
                editing={editingId === item.id}
                onEdit={() => setEditingId(item.id)}
                onCancelEdit={() => setEditingId(null)}
                onSave={(changes) => {
                  updateItem(item.id, changes);
                  setEditingId(null);
                }}
                onRemove={() => remove(item)}
                onChangeQuantity={(delta) => changeQuantity(item.id, delta)}
              />
            ))}
          </ul>
        ) : (
          <p className="sp-empty">
            {items.length === 0 ? 'Spiżarnia jest pusta. Dodaj pierwszy produkt powyżej.' : 'Nic nie pasuje do wyszukiwania.'}
          </p>
        )}
      </section>

      {undo && (
        <div className="sp-toast" role="status">
          <span>Usunięto: {undo.item.name}</span>
          <button
            type="button"
            className="sp-toast__btn"
            onClick={() => {
              restoreItem(undo.item, undo.index);
              setUndo(null);
            }}
          >
            Cofnij
          </button>
        </div>
      )}
    </div>
  );
}
