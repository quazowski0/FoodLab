const fmt = (n) => Number(n).toLocaleString('pl-PL', { maximumFractionDigits: 1 });

// Jeden wynik na liście wyników
export default function ProductRow({ product, selected, onSelect, onRemove }) {
  const n = product.nutrition;
  return (
    <li className="pd-row-wrap">
      <button type="button" className="pd-row" aria-current={selected} onClick={() => onSelect(product.id)}>
        {product.image ? (
          <img className="pd-thumb" src={product.image} alt="" loading="lazy" />
        ) : (
          <span className="pd-thumb pd-thumb--empty" aria-hidden="true" />
        )}
        <span className="pd-row__main">
          <span className="pd-row__name">{product.name}</span>
          <span className="pd-row__meta">
            {product.brand && <span>{product.brand}</span>}
            {product.source === 'reczne' && <span className="pd-tag">Własny</span>}
          </span>
        </span>
        <span className="pd-row__kcal">
          {n ? (
            <>
              <b>{fmt(n.kcal)}</b> <small>kcal</small>
            </>
          ) : (
            <small>brak danych</small>
          )}
        </span>
      </button>
      {onRemove && (
        <button type="button" className="pd-icon-btn pd-icon-btn--danger" onClick={() => onRemove(product)} aria-label={`Usuń: ${product.name}`} title="Usuń">
          ×
        </button>
      )}
    </li>
  );
}
