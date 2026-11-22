import { useSearchParams } from 'react-router-dom';
import Pantry from './Pantry.jsx';
import Products from './Products.jsx';
import '../features/spizarnia/spizarnia.css';

const TABS = [
  { id: 'spizarnia', label: 'Moje produkty', owner: 'Olek' },
  { id: 'baza', label: 'Szukaj w bazie', owner: 'Michał' },
];

// Strona /spizarnia: jedna zakładka z dwiema częściami.
//   "Moje produkty"  = wirtualna spiżarnia (Olek, pages/Pantry.jsx)
//   "Szukaj w bazie" = baza produktów z Open Food Facts (Michał, pages/Products.jsx)
// "Moje produkty" to sama lista; produkty dodaje się z bazy (wyszukiwarka, skaner kodu albo ręcznie).
export default function PantryHub() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('zakladka') === 'baza' ? 'baza' : 'spizarnia';
  const setTab = (t) => {
    setParams(t === 'baza' ? { zakladka: 'baza' } : {}, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="sp">
      <header className="sp-head">
        <span className="kicker">Spiżarnia i baza produktów</span>
        <h1 className="sp-title">Spiżarnia</h1>
        <p className="sp-lead">
          Wpisz, co masz w kuchni, albo znajdź produkt w bazie Open Food Facts i sprawdź jego kalorie. Na tej podstawie podpowiemy przepisy i listę zakupów.
        </p>
      </header>

      <div className="sp-tabs" role="tablist" aria-label="Części spiżarni">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`sp-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="sp-pane"
            className="sp-tab"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="sp-pane" aria-labelledby={`sp-tab-${tab}`} className="sp-pane">
        {tab === 'spizarnia' ? (
          <Pantry onOpenBase={() => setTab('baza')} />
        ) : (
          <Products onShowPantry={() => setTab('spizarnia')} />
        )}
      </div>
    </div>
  );
}
