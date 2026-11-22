import { useState } from 'react';
import { buildCustomProduct } from '../customProducts.js';

const EMPTY = { name: '', brand: '', barcode: '', kcal: '', protein: '', fat: '', carbs: '' };

// Ręczne dodanie produktu, którego nie ma w Open Food Facts (wartości na 100 g)
export default function ManualProductForm({ defaults, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...defaults }));
  const [error, setError] = useState('');
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e) => {
    e.preventDefault();
    const { error: err, product } = buildCustomProduct(form);
    if (err) return setError(err);
    setError('');
    onSave(product);
    setForm(EMPTY);
  };

  const num = (key, label, unit) => (
    <label className="pd-field">
      <span className="pd-field__label">{label}</span>
      <span className="pd-input-unit">
        <input className="pd-input" inputMode="decimal" value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder="0" />
        <span>{unit}</span>
      </span>
    </label>
  );

  return (
    <form className="pd-form" onSubmit={submit} noValidate>
      <div className="pd-form__grid">
        <label className="pd-field pd-field--wide">
          <span className="pd-field__label">Nazwa produktu</span>
          <input className="pd-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="np. Domowy hummus" maxLength={80} autoComplete="off" />
        </label>
        <label className="pd-field">
          <span className="pd-field__label">Marka (opcjonalnie)</span>
          <input className="pd-input" value={form.brand} onChange={(e) => set('brand', e.target.value)} maxLength={40} autoComplete="off" />
        </label>
        <label className="pd-field">
          <span className="pd-field__label">Kod kreskowy (opcjonalnie)</span>
          <input className="pd-input" inputMode="numeric" value={form.barcode} onChange={(e) => set('barcode', e.target.value.replace(/\D/g, ''))} maxLength={14} />
        </label>
      </div>

      <fieldset className="pd-fieldset">
        <legend>Wartości odżywcze na 100 g (opcjonalnie)</legend>
        <div className="pd-form__nums">
          {num('kcal', 'Kalorie', 'kcal')}
          {num('protein', 'Białko', 'g')}
          {num('fat', 'Tłuszcze', 'g')}
          {num('carbs', 'Węglowodany', 'g')}
        </div>
      </fieldset>

      <div className="pd-form__actions">
        {error && <p className="pd-error" role="alert">{error}</p>}
        {onCancel && <button type="button" className="pd-btn pd-btn--ghost" onClick={onCancel}>Anuluj</button>}
        <button type="submit" className="pd-btn pd-btn--primary">Zapisz produkt</button>
      </div>
    </form>
  );
}
