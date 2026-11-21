import { Link } from 'react-router-dom';

const MACROS = [
  { key: 'protein', label: 'Białko', cls: 'protein' },
  { key: 'fat', label: 'Tłuszcze', cls: 'fat' },
  { key: 'carbs', label: 'Węglowodany', cls: 'carbs' },
];

const fmt = (n) => Number(n).toLocaleString('pl-PL', { maximumFractionDigits: 1 });
const SOURCE_LABEL = { openfoodfacts: 'Open Food Facts', reczne: 'Własny produkt' };

// Karta szczegółów: kalorie i makro na 100 g, przycisk przekazujący produkt do spiżarni
export default function ProductDetail({ product, added, onAdd, onCompleteManually, onClose }) {
  const n = product.nutrition;
  const maxMacro = n ? Math.max(n.protein, n.fat, n.carbs, 1) : 1;

  return (
    <aside className="pd-detail" aria-live="polite">
      <div className="pd-detail__head">
        {product.image ? <img className="pd-thumb pd-thumb--lg" src={product.image} alt="" loading="lazy" /> : null}
        <div className="pd-detail__title">
          <h3>{product.name}</h3>
          <p className="pd-muted">
            {[product.brand, product.pack ? `${fmt(product.pack.quantity)} ${product.pack.unit}` : '']
              .filter(Boolean)
              .join(' · ') || SOURCE_LABEL[product.source]}
          </p>
        </div>
        {onClose && (
          <button type="button" className="pd-icon-btn pd-detail__close" onClick={onClose} aria-label="Zamknij szczegóły">
            ×
          </button>
        )}
      </div>

      {n ? (
        <>
          <p className="pd-kcal">
            {fmt(n.kcal)} <small>kcal na 100 g</small>
          </p>
          <ul className="pd-macros">
            {MACROS.map(({ key, label, cls }) => (
              <li key={key}>
                <div className="pd-macros__row">
                  <span>{label}</span>
                  <b>{fmt(n[key])} g</b>
                </div>
                <div className="pd-bar" aria-hidden="true">
                  <i className={`pd-bar__fill pd-bar__fill--${cls}`} style={{ width: `${(n[key] / maxMacro) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="pd-notice pd-notice--warn">
          <span>Open Food Facts nie ma danych odżywczych dla tego produktu.</span>
          {onCompleteManually && (
            <button type="button" className="pd-btn pd-btn--ghost pd-btn--sm" onClick={() => onCompleteManually(product)}>
              Uzupełnij ręcznie
            </button>
          )}
        </div>
      )}

      <p className="pd-source">
        {SOURCE_LABEL[product.source]}
        {product.barcode ? ` · kod ${product.barcode}` : ''}
      </p>

      <div className="pd-detail__actions">
        <button type="button" className="pd-btn pd-btn--primary" onClick={() => onAdd(product)}>
          {added ? 'Dodaj jeszcze raz' : 'Dodaj do spiżarni'}
        </button>
        {added && (
          <p className="pd-added" role="status">
            Dodano do spiżarni. <Link to="/spizarnia">Zobacz spiżarnię</Link>
          </p>
        )}
      </div>
    </aside>
  );
}
