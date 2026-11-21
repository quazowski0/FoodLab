import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePantry } from '../features/spizarnia';
import { sortPantry } from '../features/spizarnia/pantryStore.js';
import { analyzeRecipe, queryName, rankRecipes } from '../features/przepisy/ingredients.js';
import { LOCAL_RECIPES } from '../features/przepisy/localRecipes.js';
import { DAILY_LIMIT, HAS_KEY, findByIngredients, getCachedSuggestions, getUsage } from '../features/przepisy/spoonacular.js';
import { toPantryEntry, useShoppingList } from '../features/przepisy/shoppingList.js';
import RecipeCard from '../features/przepisy/components/RecipeCard.jsx';
import RecipeDetail from '../features/przepisy/components/RecipeDetail.jsx';
import ShoppingList from '../features/przepisy/components/ShoppingList.jsx';
import '../features/przepisy/przepisy.css';

const MAX_QUERY_ITEMS = 15; // tyle produktów (te z najkrótszą ważnością) idzie do zapytania
const FILTERS = [
  { id: 'all', label: 'Wszystkie', max: Infinity },
  { id: '0', label: 'Bez braków', max: 0 },
  { id: '2', label: 'Brakuje do 2', max: 2 },
];

const ERRORS = {
  limit: 'Dzienny limit zapytań do Spoonacular został wykorzystany. Wróć jutro albo skorzystaj z już pobranych propozycji.',
  quota: 'Limit zapytań Spoonacular został wyczerpany. Spróbuj jutro.',
  key: 'Klucz API Spoonacular jest nieprawidłowy. Sprawdź plik .env.local.',
  timeout: 'Spoonacular nie odpowiada. Spróbuj za chwilę.',
  offline: 'Nie udało się połączyć ze Spoonacular. Sprawdź internet i spróbuj jeszcze raz.',
  http: 'Spoonacular zwróciło błąd. Spróbuj za chwilę.',
};

// Strona /przepisy (Krzysiek): propozycje dań ze spiżarni i lista zakupów
export default function Recipes() {
  const { available, addItem } = usePantry();
  const shopping = useShoppingList();
  const [params, setParams] = useSearchParams();
  const tab = params.get('zakladka') === 'zakupy' ? 'zakupy' : 'propozycje';
  const setTab = (t) => setParams(t === 'zakupy' ? { zakladka: 'zakupy' } : {}, { replace: true });

  // nazwy do zapytania: najpierw produkty, którym kończy się data ważności
  const names = useMemo(() => {
    const sorted = sortPantry(available, 'expiry').slice(0, MAX_QUERY_ITEMS);
    return [...new Set(sorted.map(queryName).filter(Boolean))];
  }, [available]);
  const queryKey = [...names].sort().join(',');

  // tryb demo: przepisy lokalne; tryb API: wynik ostatniego wyszukiwania (z cache, jeśli jest)
  const [api, setApi] = useState(() => {
    const cache = HAS_KEY ? getCachedSuggestions(names) : null;
    return { status: cache ? 'done' : 'idle', recipes: cache?.recipes ?? [], key: cache ? queryKey : '', error: '', at: cache?.at ?? null };
  });
  const [usage, setUsage] = useState(getUsage);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [moved, setMoved] = useState(0);
  const abortRef = useRef(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  const search = async (force = false) => {
    if (!names.length) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setApi((a) => ({ ...a, status: 'loading', error: '' }));
    try {
      const { recipes, at } = await findByIngredients(names, { signal: ctrl.signal, force });
      setApi({ status: 'done', recipes, key: queryKey, error: '', at });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setApi((a) => ({ ...a, status: 'error', error: ERRORS[err.kind] ?? ERRORS.offline }));
    } finally {
      setUsage(getUsage());
    }
  };

  const source = HAS_KEY ? api.recipes : LOCAL_RECIPES;
  const ranked = useMemo(
    () => rankRecipes(source.map((recipe) => ({ recipe, analysis: analyzeRecipe(recipe, available) }))),
    [source, available],
  );
  const max = FILTERS.find((f) => f.id === filter).max;
  const visible = ranked.filter((x) => x.analysis.missingCount <= max);
  const selected = source.find((r) => r.id === selectedId) ?? null;

  const status = HAS_KEY ? api.status : 'done';
  const stale = HAS_KEY && api.status === 'done' && api.key !== queryKey;

  const moveToPantry = () => {
    const bought = shopping.items.filter((x) => x.checked);
    bought.forEach((x) => addItem(toPantryEntry(x)));
    shopping.removeMany(bought.map((x) => x.id));
    setMoved(bought.length);
  };

  const toBuy = shopping.items.filter((x) => !x.checked).length;

  return (
    <div className="rc">
      <header className="rc-head">
        <span className="kicker">Przepisy i lista zakupów</span>
        <h1 className="rc-title">Co dziś ugotujesz?</h1>
        <p className="rc-lead">Dobieramy dania do tego, co masz w spiżarni. Widzisz, czego brakuje, i jednym kliknięciem robisz z tego listę zakupów.</p>
      </header>

      <div className="rc-tabs" role="tablist" aria-label="Widoki">
        <button type="button" role="tab" id="rc-tab-propozycje" aria-selected={tab === 'propozycje'} aria-controls="rc-pane" className="rc-tab" onClick={() => setTab('propozycje')}>
          Propozycje
        </button>
        <button type="button" role="tab" id="rc-tab-zakupy" aria-selected={tab === 'zakupy'} aria-controls="rc-pane" className="rc-tab" onClick={() => setTab('zakupy')}>
          Lista zakupów{toBuy > 0 && <span className="rc-count">{toBuy}</span>}
        </button>
      </div>

      <section className="rc-panel" role="tabpanel" id="rc-pane" aria-labelledby={`rc-tab-${tab}`}>
        {tab === 'zakupy' && (
          <ShoppingList
            items={shopping.items}
            moved={moved}
            onToggle={(id) => { setMoved(0); shopping.toggle(id); }}
            onRemove={shopping.remove}
            onClear={() => { setMoved(0); shopping.clear(); }}
            onMoveToPantry={moveToPantry}
            onRemoveChecked={() => shopping.removeMany(shopping.items.filter((x) => x.checked).map((x) => x.id))}
          />
        )}

        {tab === 'propozycje' && selected && (
          <RecipeDetail
            key={selected.id}
            base={selected}
            pantry={available}
            list={shopping.items}
            onBack={() => setSelectedId(null)}
            onAddToList={(title, rows) => shopping.addRows(title, rows)}
          />
        )}

        {tab === 'propozycje' && !selected && (
          <>
            <div className="rc-bar">
              <p className="rc-muted">
                {available.length > 0 ? (
                  <>W spiżarni: <b>{available.length}</b> {available.length === 1 ? 'produkt' : 'produktów'}. <Link to="/spizarnia" className="rc-link">Edytuj</Link></>
                ) : (
                  'Spiżarnia jest pusta.'
                )}
              </p>
              {HAS_KEY ? (
                <div className="rc-bar__tools">
                  <span className="rc-muted" title="Zapytania do Spoonacular dziś">Zapytania: {usage}/{DAILY_LIMIT}</span>
                  <button type="button" className="rc-btn rc-btn--primary rc-btn--sm" onClick={() => search(api.status === 'done')} disabled={api.status === 'loading' || !names.length}>
                    {api.status === 'loading' ? 'Szukam...' : api.status === 'done' ? 'Odśwież propozycje' : 'Znajdź przepisy'}
                  </button>
                </div>
              ) : (
                <span className="rc-badge rc-badge--demo" title="Dodaj klucz Spoonacular w .env.local, żeby pobierać prawdziwe przepisy">Tryb demo</span>
              )}
            </div>

            {!HAS_KEY && (
              <p className="rc-notice rc-notice--info">
                Brak klucza API, więc pokazujemy {LOCAL_RECIPES.length} przepisów przykładowych. Prawdziwe przepisy ze Spoonacular włączysz, wpisując klucz do <code>.env.local</code> (patrz README).
              </p>
            )}

            {available.length === 0 && (
              <div className="rc-empty">
                <p>Nie mamy z czego dobierać przepisów.</p>
                <Link to="/spizarnia" className="rc-btn rc-btn--primary">Dodaj produkty do spiżarni</Link>
              </div>
            )}

            {available.length > 0 && HAS_KEY && status === 'idle' && (
              <div className="rc-empty">
                <p>Kliknij „Znajdź przepisy”, a dopasujemy dania do Twojej spiżarni.</p>
                <p className="rc-muted">Wyniki zapisujemy w przeglądarce, żeby oszczędzać dzienny limit zapytań.</p>
              </div>
            )}

            {status === 'loading' && (
              <ul className="rc-grid" aria-busy="true" aria-label="Wczytywanie przepisów">
                {[0, 1, 2, 3, 4, 5].map((i) => <li key={i} className="rc-skeleton rc-skeleton--card" />)}
              </ul>
            )}

            {api.status === 'error' && HAS_KEY && (
              <div className="rc-notice rc-notice--error" role="alert">
                <span>{api.error}</span>
                {!['limit', 'quota', 'key'].some((k) => api.error === ERRORS[k]) && (
                  <button type="button" className="rc-btn rc-btn--ghost rc-btn--sm" onClick={() => search(true)}>Spróbuj ponownie</button>
                )}
              </div>
            )}

            {stale && (
              <p className="rc-notice rc-notice--info">Spiżarnia się zmieniła od ostatniego wyszukiwania. Kliknij „Odśwież propozycje”, żeby znaleźć przepisy do nowych składników.</p>
            )}

            {available.length > 0 && status === 'done' && (
              <>
                <div className="rc-seg" role="group" aria-label="Filtr braków">
                  {FILTERS.map((f) => (
                    <button key={f.id} type="button" className="rc-seg__btn" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
                  ))}
                </div>
                {visible.length > 0 ? (
                  <ul className="rc-grid">
                    {visible.map(({ recipe, analysis }) => (
                      <RecipeCard key={recipe.id} recipe={recipe} analysis={analysis} onSelect={setSelectedId} />
                    ))}
                  </ul>
                ) : (
                  <div className="rc-empty">
                    <p>{ranked.length ? 'Żaden przepis nie spełnia wybranego filtra.' : 'Nic nie pasuje do Twoich produktów.'}</p>
                    <p className="rc-muted">{ranked.length ? 'Zmień filtr braków.' : 'Dodaj więcej składników do spiżarni.'}</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
