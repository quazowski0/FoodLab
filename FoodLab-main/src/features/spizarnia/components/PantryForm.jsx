import { useId, useState } from 'react';
import { UNITS, addDays } from '../pantryStore.js';

const QUICK_DATES = [
  { label: 'Za 3 dni', days: 3 },
  { label: 'Za tydzień', days: 7 },
  { label: 'Za miesiąc', days: 30 },
];

const EMPTY = { name: '', quantity: '1', unit: 'szt', expiry: '' };

function fmt(n) {
  return Number(n).toLocaleString('pl-PL', { maximumFractionDigits: 1 });
}

// Formularz dodawania i edycji produktu.
// initial = edycja istniejącego produktu ("Zapisz" / "Anuluj"),
// defaults = nowy produkt z wypełnionymi polami, np. po zeskanowaniu kodu kreskowego.
export default function PantryForm({ initial, defaults, onSubmit, onCancel, compact = false }) {
  const uid = useId();
  const [form, setForm] = useState(() => {
    const start = initial ?? { ...EMPTY, ...defaults };
    return { ...start, quantity: String(start.quantity ?? EMPTY.quantity) };
  });
  const [error, setError] = useState('');
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e) => {
    e.preventDefault();
    const quantity = Number(String(form.quantity).replace(',', '.'));
    if (!form.name.trim()) return setError('Wpisz nazwę produktu.');
    if (!Number.isFinite(quantity) || quantity <= 0) return setError('Ilość musi być większa od zera.');
    setError('');
    onSubmit({ ...form, name: form.name.trim(), quantity });
    if (!initial) setForm((f) => ({ ...EMPTY, unit: f.unit }));
  };

  return (
    <form className={`sp-form ${compact ? 'sp-form--compact' : ''}`} onSubmit={submit} noValidate>
      {form.barcode && (
        <p className="sp-form__from">
          <span>
            Kod {form.barcode}
            {form.source === 'openfoodfacts' && ' · Open Food Facts'}
          </span>
          {form.nutrition && (
            <span>
              100 g: {fmt(form.nutrition.kcal)} kcal, B {fmt(form.nutrition.protein)} g, T {fmt(form.nutrition.fat)} g, W{' '}
              {fmt(form.nutrition.carbs)} g
            </span>
          )}
          {!initial && (
            <button type="button" className="sp-link" onClick={() => setForm((f) => ({ ...EMPTY, unit: f.unit }))}>
              Wyczyść
            </button>
          )}
        </p>
      )}
      <div className="sp-form__grid">
        <label className="sp-field sp-field--name">
          <span className="sp-field__label">Produkt</span>
          <input
            className="sp-input"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="np. Mleko 2%"
            autoComplete="off"
            maxLength={60}
            autoFocus={Boolean(initial)}
          />
        </label>

        <label className="sp-field sp-field--qty">
          <span className="sp-field__label">Ilość</span>
          <input
            className="sp-input"
            inputMode="decimal"
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
          />
        </label>

        <div className="sp-field sp-field--unit">
          <span className="sp-field__label" id={`${uid}-unit`}>Jednostka</span>
          <div className="sp-seg" role="group" aria-labelledby={`${uid}-unit`}>
            {UNITS.map((u) => (
              <button
                key={u.value}
                type="button"
                className="sp-seg__btn"
                aria-pressed={form.unit === u.value}
                onClick={() => set('unit', u.value)}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sp-field sp-field--date">
          <label className="sp-field__label" htmlFor={`${uid}-date`}>Data ważności</label>
          <input
            id={`${uid}-date`}
            className="sp-input"
            type="date"
            value={form.expiry}
            onChange={(e) => set('expiry', e.target.value)}
          />
          <div className="sp-chips">
            {QUICK_DATES.map((q) => (
              <button key={q.days} type="button" className="sp-chip" onClick={() => set('expiry', addDays(q.days))}>
                {q.label}
              </button>
            ))}
            <button type="button" className="sp-chip" aria-pressed={!form.expiry} onClick={() => set('expiry', '')}>
              Bez daty
            </button>
          </div>
        </div>
      </div>

      <div className="sp-form__actions">
        {error && <p className="sp-error" role="alert">{error}</p>}
        {onCancel && (
          <button type="button" className="sp-btn sp-btn--ghost" onClick={onCancel}>Anuluj</button>
        )}
        <button type="submit" className="sp-btn sp-btn--primary">{initial ? 'Zapisz' : 'Dodaj do spiżarni'}</button>
      </div>
    </form>
  );
}
