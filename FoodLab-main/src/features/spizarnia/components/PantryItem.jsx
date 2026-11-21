import { expiryLabel, expiryStatus, formatDate, formatQuantity, unitInfo } from '../pantryStore.js';
import PantryForm from './PantryForm.jsx';

const STATUS_TEXT = { expired: 'Po terminie', soon: 'Kończy się', ok: 'Świeże', none: 'Bez daty' };

function Icon({ d }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Jeden wiersz listy. W trybie edycji zamienia się w formularz.
export default function PantryItem({ item, editing, onEdit, onCancelEdit, onSave, onRemove, onChangeQuantity }) {
  const status = expiryStatus(item.expiry);
  const step = unitInfo(item.unit).step;

  if (editing) {
    return (
      <li className="sp-item sp-item--editing">
        <PantryForm initial={item} compact onSubmit={onSave} onCancel={onCancelEdit} />
      </li>
    );
  }

  return (
    <li className={`sp-item sp-item--${status} ${item.quantity === 0 ? 'is-empty' : ''}`}>
      <span className="sp-item__dot" aria-hidden="true" />
      <div className="sp-item__main">
        <h3 className="sp-item__name">{item.name}</h3>
        <p className="sp-item__meta">
          <span className={`sp-badge sp-badge--${status}`}>{STATUS_TEXT[status]}</span>
          <span>{expiryLabel(item.expiry)}</span>
          {item.expiry && <span className="sp-item__date">{formatDate(item.expiry)}</span>}
        </p>
      </div>

      <div className="sp-qty" role="group" aria-label={`Ilość: ${item.name}`}>
        <button
          type="button"
          className="sp-icon-btn"
          onClick={() => onChangeQuantity(-step)}
          disabled={item.quantity === 0}
          aria-label={`Zmniejsz o ${step}`}
        >
          <Icon d="M5 10h10" />
        </button>
        <output className="sp-qty__value">{item.quantity === 0 ? 'brak' : formatQuantity(item.quantity, item.unit)}</output>
        <button type="button" className="sp-icon-btn" onClick={() => onChangeQuantity(step)} aria-label={`Zwiększ o ${step}`}>
          <Icon d="M10 5v10M5 10h10" />
        </button>
      </div>

      <div className="sp-item__actions">
        <button type="button" className="sp-icon-btn" onClick={onEdit} aria-label={`Edytuj: ${item.name}`} title="Edytuj">
          <Icon d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5z" />
        </button>
        <button type="button" className="sp-icon-btn sp-icon-btn--danger" onClick={onRemove} aria-label={`Usuń: ${item.name}`} title="Usuń">
          <Icon d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" />
        </button>
      </div>
    </li>
  );
}
