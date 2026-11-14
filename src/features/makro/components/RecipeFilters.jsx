import { useState } from 'react';
import { DIFFICULTY_LABELS, DIFFICULTY_LEVELS } from '../difficulty.js';
import { KCAL_NO_LIMIT, SORT_OPTIONS } from '../filters.js';
import { fmt } from '../nutrition.js';

// Ile ręcznych filtrów odbiega od domyślnych (liczba na przycisku „Więcej filtrów”)
function countActive(f) {
  let n = 0;
  if (f.maxKcal < KCAL_NO_LIMIT) n += 1;
  if (f.difficulty.length < DIFFICULTY_LEVELS.length) n += 1;
  if (f.highProtein) n += 1;
  return n;
}

export default function RecipeFilters({ filters, onChange, next }) {
  const [open, setOpen] = useState(false);
  const set = (patch) => onChange({ ...filters, ...patch, preset: null });

  const toggleLevel = (level) => {
    const has = filters.difficulty.includes(level);
    set({ difficulty: has ? filters.difficulty.filter((l) => l !== level) : [...filters.difficulty, level] });
  };

  const fitLabel = next.slot ? `${next.slot.name}: do ${fmt(next.kcal)} kcal` : `zostało ${fmt(next.kcal)} kcal`;
  const active = countActive(filters);

  return (
    <div className="mk-filters-wrap">
      <div className="mk-quick">
        <label className="mk-switch">
          <input type="checkbox" checked={filters.fitDay} onChange={() => set({ fitDay: !filters.fitDay })} />
          <span className="mk-switch__track" aria-hidden="true"><span /></span>
          <span className="mk-switch__text">Tylko to, co zmieści się w moim dniu <small>{fitLabel}</small></span>
        </label>
        <button type="button" className="mk-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? 'Ukryj filtry' : 'Więcej filtrów'}{active > 0 && ` (${active})`}
        </button>
      </div>

      {open && (
        <div className="mk-filters" role="group" aria-label="Filtry przepisów">
          <div className="mk-field">
            <label className="mk-field__label" htmlFor="mk-kcal">
              Maks. kalorii na porcję
              <output htmlFor="mk-kcal">{filters.fitDay ? 'ustawia filtr dnia' : filters.maxKcal >= KCAL_NO_LIMIT ? 'bez limitu' : `${filters.maxKcal} kcal`}</output>
            </label>
            <input id="mk-kcal" type="range" min="200" max={KCAL_NO_LIMIT} step="50" value={filters.maxKcal} disabled={filters.fitDay}
              onChange={(e) => set({ maxKcal: Number(e.target.value) })} />
          </div>
          <div className="mk-field">
            <span className="mk-field__label">Trudność</span>
            <div className="mk-chips">
              {DIFFICULTY_LEVELS.map((level) => (
                <button key={level} type="button" className={`mk-chip mk-chip--${level}`} aria-pressed={filters.difficulty.includes(level)} onClick={() => toggleLevel(level)}>
                  <span className="mk-pip" />{DIFFICULTY_LABELS[level]}
                </button>
              ))}
              <button type="button" className="mk-chip mk-chip--toggle" aria-pressed={filters.highProtein} onClick={() => set({ highProtein: !filters.highProtein })}>
                Dużo białka
              </button>
            </div>
          </div>
          <div className="mk-field">
            <span className="mk-field__label">Sortuj według</span>
            <div className="mk-seg" role="group" aria-label="Sortowanie">
              {SORT_OPTIONS.map((o) => (
                <button key={o.value} type="button" className="mk-seg__btn" aria-pressed={filters.sort === o.value} onClick={() => set({ sort: o.value })}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
