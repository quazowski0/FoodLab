import { Link } from 'react-router-dom';
import { formatAmount } from '../ingredients.js';

// Lista zakupów: odhaczanie kupionych, przeniesienie ich do spiżarni
export default function ShoppingList({ items, onToggle, onRemove, onClear, onMoveToPantry, onRemoveChecked, moved }) {
  const checked = items.filter((x) => x.checked);

  if (!items.length) {
    return (
      <div className="rc-empty">
        <p>Lista zakupów jest pusta.</p>
        <p className="rc-muted">Otwórz przepis i dodaj brakujące składniki jednym kliknięciem.</p>
        {moved > 0 && (
          <p className="rc-note rc-note--ok" role="status">
            Przeniesiono do spiżarni: {moved}. <Link to="/spizarnia" className="rc-link">Zobacz spiżarnię</Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rc-shop">
      <p className="rc-muted" aria-live="polite">
        {items.length - checked.length === 0 ? 'Wszystko kupione.' : `Do kupienia: ${items.length - checked.length} z ${items.length}`}
      </p>
      <ul className="rc-shop__list">
        {items.map((item) => (
          <li key={item.id} className={`rc-shop__item ${item.checked ? 'is-checked' : ''}`}>
            <label className="rc-shop__check">
              <input type="checkbox" checked={item.checked} onChange={() => onToggle(item.id)} />
              <span className="rc-shop__main">
                <span className="rc-shop__name">{item.name}</span>
                <span className="rc-muted">
                  {[formatAmount(item.amount, item.unit), item.recipes.join(', ')].filter(Boolean).join(' · ')}
                </span>
              </span>
            </label>
            <button type="button" className="rc-icon-btn" onClick={() => onRemove(item.id)} aria-label={`Usuń z listy: ${item.name}`} title="Usuń">×</button>
          </li>
        ))}
      </ul>

      <div className="rc-shop__actions">
        <button type="button" className="rc-btn rc-btn--primary" onClick={onMoveToPantry} disabled={!checked.length}>
          Kupione do spiżarni{checked.length ? ` (${checked.length})` : ''}
        </button>
        <button type="button" className="rc-btn rc-btn--ghost" onClick={onRemoveChecked} disabled={!checked.length}>Usuń zaznaczone</button>
        <button type="button" className="rc-btn rc-btn--ghost" onClick={onClear}>Wyczyść listę</button>
      </div>
      {moved > 0 && (
        <p className="rc-note rc-note--ok" role="status">
          Przeniesiono do spiżarni: {moved}. <Link to="/spizarnia" className="rc-link">Zobacz spiżarnię</Link>
        </p>
      )}
    </div>
  );
}
