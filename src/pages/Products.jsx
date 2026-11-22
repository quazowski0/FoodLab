import { useEffect, useMemo, useRef, useState } from 'react';
import { usePantry } from '../features/spizarnia';
import { searchProducts, toPantryItem, useCustomProducts } from '../features/baza';
import { searchBasic } from '../features/baza/basicProducts.js';
import { searchUsda } from '../features/baza/usda.js';
import ProductRow from '../features/baza/components/ProductRow.jsx';
import ProductDetail from '../features/baza/components/ProductDetail.jsx';
import ManualProductForm from '../features/baza/components/ManualProductForm.jsx';
import BarcodeLookup from '../features/baza/components/BarcodeLookup.jsx';
import '../features/baza/baza.css';

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').trim();

const ERRORS = {
  offline: 'Nie udało się połączyć z Open Food Facts. Sprawdź internet i spróbuj jeszcze raz.',
  timeout: 'Open Food Facts nie odpowiada. Spróbuj za chwilę.',
  http: 'Open Food Facts zwróciło błąd. Spróbuj za chwilę.',
};

// Część "Szukaj w bazie" na stronie /spizarnia (Michał): wyszukiwanie produktów, skaner kodu,
// ręczne dodawanie i przekazanie do spiżarni (z ilością i datą ważności).
// onShowPantry = przejście do listy "Moje produkty".
export default function Products({ onShowPantry }) {
  const { addItem } = usePantry();
  const custom = useCustomProducts();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState({ status: 'idle', term: '', results: [], error: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [added, setAdded] = useState(() => new Set());
  const [form, setForm] = useState({ open: false, n: 0, defaults: null });
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const runSearch = async (term) => {
    const q = term.trim();
    if (q.length < 2) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSearch({ status: 'loading', term: q, results: [], usda: [], error: '' });
    setSelectedId(null);
    // Open Food Facts i USDA równolegle; błąd USDA nie przeszkadza (to tylko dodatkowe źródło)
    const [off, usda] = await Promise.allSettled([
      searchProducts(q, { signal: ctrl.signal }),
      searchUsda(q, { signal: ctrl.signal }),
    ]);
    if (ctrl.signal.aborted) return;
    const usdaResults = usda.status === 'fulfilled' ? usda.value : [];
    if (off.status === 'fulfilled') {
      setSearch({ status: 'done', term: q, results: off.value, usda: usdaResults, error: '' });
    } else {
      setSearch({ status: 'error', term: q, results: [], usda: usdaResults, error: ERRORS[off.reason?.kind] ?? ERRORS.offline });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  // własne produkty pasujące do wyszukiwania idą na górę listy
  const ownMatches = useMemo(() => {
    const q = norm(search.term);
    return q ? custom.items.filter((p) => norm(`${p.name} ${p.brand}`).includes(q)) : [];
  }, [custom.items, search.term]);
  // produkty podstawowe (owoce, warzywa...), których Open Food Facts zwykle nie ma
  const basicMatches = useMemo(() => searchBasic(search.term), [search.term]);
  const list = [...ownMatches, ...basicMatches, ...(search.usda ?? []), ...search.results];

  const selected = [...list, ...custom.items].find((p) => p.id === selectedId) ?? null;
  // szczegóły pokazujemy tylko w tym panelu, w którym jest wybrany produkt
  const inSearch = Boolean(selected) && list.some((p) => p.id === selected.id);
  const inOwn = Boolean(selected) && !inSearch && selected.source === 'reczne';

  const addToPantry = (product, pantryItem) => {
    addItem(pantryItem ?? toPantryItem(product));
    setAdded((s) => new Set(s).add(product.id));
  };

  const showScanResult = (product) => {
    setSearch({ status: 'done', term: product.barcode, results: [product], usda: [], error: '' });
    setQuery('');
    setSelectedId(product.id);
  };

  const openForm = (defaults = null) => setForm((f) => ({ open: true, n: f.n + 1, defaults }));

  const saveCustom = (product) => {
    custom.add(product);
    setForm((f) => ({ ...f, open: false }));
    setSelectedId(product.id);
  };

  const removeCustom = (product) => {
    custom.remove(product.id);
    if (selectedId === product.id) setSelectedId(null);
  };

  const { status } = search;
  const showResults = status === 'done' || status === 'error' || ownMatches.length > 0 || basicMatches.length > 0;

  return (
    <div className="pd">
      <section className="pd-panel" aria-labelledby="pd-search-title">
        <h2 className="pd-h2" id="pd-search-title">Wyszukiwarka</h2>
        <p className="pd-muted">
          Znajdź produkt po nazwie albo kodzie kreskowym i zobacz kalorie oraz makroskładniki na 100 g. Czego nie ma w bazie, dodasz sam.
        </p>
        <form className="pd-search" onSubmit={onSubmit} role="search">
          <input
            className="pd-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="np. jogurt naturalny, płatki owsiane"
            aria-label="Nazwa produktu"
            autoComplete="off"
          />
          <button type="submit" className="pd-btn pd-btn--primary" disabled={status === 'loading' || query.trim().length < 2}>
            {status === 'loading' ? 'Szukam...' : 'Szukaj'}
          </button>
        </form>
        <BarcodeLookup onResult={showScanResult} onMissing={(code) => openForm({ barcode: code })} />

        {status === 'loading' && (
          <ul className="pd-list" aria-busy="true" aria-label="Wczytywanie wyników">
            {[0, 1, 2, 3].map((i) => <li key={i} className="pd-skeleton" />)}
          </ul>
        )}

        {status === 'error' && (
          <div className={`pd-notice ${list.length ? 'pd-notice--warn' : 'pd-notice--error'}`} role="alert">
            <span>{list.length ? 'Open Food Facts chwilowo nie odpowiada, więc pokazujemy wyniki z pozostałych źródeł.' : search.error}</span>
            <button type="button" className="pd-btn pd-btn--ghost pd-btn--sm" onClick={() => runSearch(search.term)}>Spróbuj ponownie</button>
          </div>
        )}

        {status !== 'loading' && showResults && (
          <div className={`pd-results ${inSearch ? 'has-detail' : ''}`}>
            <div className="pd-results__list">
              {list.length > 0 ? (
                <>
                  <p className="pd-muted pd-count">{list.length === 1 ? '1 wynik' : `${list.length} wyników`} dla „{search.term}”</p>
                  <ul className="pd-list">
                    {list.map((p) => (
                      <ProductRow key={p.id} product={p} selected={p.id === selectedId} onSelect={setSelectedId} />
                    ))}
                  </ul>
                </>
              ) : (
                status === 'done' && (
                  <div className="pd-empty">
                    <p>Nie znaleziono produktu „{search.term}”.</p>
                    <button type="button" className="pd-btn pd-btn--ghost" onClick={() => openForm({ name: search.term })}>
                      Dodaj go ręcznie
                    </button>
                  </div>
                )
              )}
            </div>
            {inSearch && (
              <ProductDetail
                key={selected.id}
                product={selected}
                added={added.has(selected.id)}
                onAdd={addToPantry} onShowPantry={onShowPantry}
                onCompleteManually={(p) => openForm({ name: p.name, brand: p.brand, barcode: p.barcode })}
                onClose={() => setSelectedId(null)}
              />
            )}
          </div>
        )}

        {status === 'idle' && ownMatches.length === 0 && basicMatches.length === 0 && (
          <p className="pd-empty pd-empty--idle">Wpisz nazwę produktu albo zeskanuj kod, żeby zobaczyć wartości odżywcze.</p>
        )}
      </section>

      <section className="pd-panel" aria-labelledby="pd-own-title">
        <div className="pd-toolbar">
          <h2 className="pd-h2" id="pd-own-title">Własne produkty</h2>
          {!form.open && (
            <button type="button" className="pd-btn pd-btn--ghost" onClick={() => openForm()}>Dodaj produkt ręcznie</button>
          )}
        </div>
        {form.open && (
          <ManualProductForm key={form.n} defaults={form.defaults} onSave={saveCustom} onCancel={() => setForm((f) => ({ ...f, open: false }))} />
        )}
        {custom.items.length > 0 ? (
          <div className={`pd-results ${inOwn ? 'has-detail' : ''}`}>
            <ul className="pd-list">
              {custom.items.map((p) => (
                <ProductRow key={p.id} product={p} selected={p.id === selectedId} onSelect={setSelectedId} onRemove={removeCustom} />
              ))}
            </ul>
            {inOwn && (
              <ProductDetail key={selected.id} product={selected} added={added.has(selected.id)} onAdd={addToPantry} onShowPantry={onShowPantry} onClose={() => setSelectedId(null)} />
            )}
          </div>
        ) : (
          !form.open && <p className="pd-empty pd-empty--idle">Nie dodano jeszcze żadnych własnych produktów. Zapisują się w tej przeglądarce.</p>
        )}
      </section>
    </div>
  );
}
