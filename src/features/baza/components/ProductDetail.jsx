import { useState } from 'react';
import { Link } from 'react-router-dom';
import PantryForm from '../../spizarnia/components/PantryForm.jsx';
import { toPantryItem } from '../pantryBridge.js';
import Thumb from './Thumb.jsx';

const MACROS = [
  { key: 'protein', label: 'Białko', cls: 'protein' },
  { key: 'fat', label: 'Tłuszcze', cls: 'fat' },
  { key: 'carbs', label: 'Węglowodany', cls: 'carbs' },
];

const fmt = (n) => Number(n).toLocaleString('pl-PL', { maximumFractionDigits: 1 });
const SOURCE_LABEL = { openfoodfacts: 'Open Food Facts', reczne: 'Własny produkt', podstawowe: 'Produkt podstawowy, typowe wartości', usda: 'USDA FoodData Central' };

// Karta szczegółów: kalorie i makro na 100 g, dodanie do spiżarni.
// "Dodaj do spiżarni" otwiera formularz spiżarni (Olek), żeby ustawić ilość i datę ważności.
export default function ProductDetail({ product, added, onAdd, onCompleteManually, onClose, onShowPantry }) {
  const [adding, setAdding] = useState(false);
  const n = product.nutrition;
  const maxMacro = n ? Math.max(n.protein, n.fat, n.carbs, 1) : 1;

  return (
    <aside className="pd-detail" aria-live="polite">
      <div className="pd-detail__head">
        <Thumb src={product.image} name={product.name} large />
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
          <span>
            {product.source === 'reczne'
              ? 'Ten produkt nie ma wpisanych wartości odżywczych.'
              : 'Open Food Facts nie ma danych odżywczych dla tego produktu.'}
          </span>
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

      {adding ? (
        <div className="pd-detail__add">
          <PantryForm
            compact
            defaults={toPantryItem(product)}
            onSubmit={(item) => {
              onAdd(product, item);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <div className="pd-detail__actions">
          <button type="button" className="pd-btn pd-btn--primary" onClick={() => setAdding(true)}>
            {added ? 'Dodaj jeszcze raz' : 'Dodaj do spiżarni'}
          </button>
          {added && (
            <p className="pd-added" role="status">
              Dodano do spiżarni.{' '}
              {onShowPantry ? (
                <button type="button" className="pd-link" onClick={onShowPantry}>Zobacz moje produkty</button>
              ) : (
                <Link to="/spizarnia">Zobacz spiżarnię</Link>
              )}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
