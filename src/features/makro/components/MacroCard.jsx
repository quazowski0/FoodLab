import { useState } from 'react';
import DifficultyBadge from './DifficultyBadge.jsx';
import Select from './Select.jsx';
import { kcalShares, MACROS } from '../nutrition.js';

const DONUT_R = 44;
const COLORS = { protein: 'var(--mk-protein)', fat: 'var(--mk-fat)', carbs: 'var(--mk-carbs)' };

function Donut({ nutrition, portions }) {
  const shares = kcalShares(nutrition);
  const C = 2 * Math.PI * DONUT_R;
  // początek każdego segmentu = suma długości poprzednich
  const segments = MACROS.map(({ key }, i) => ({
    key,
    len: shares[key] * C,
    start: MACROS.slice(0, i).reduce((acc, m) => acc + shares[m.key] * C, 0),
  }));
  return (
    <svg className="mk-donut" viewBox="0 0 120 120" role="img" aria-label="Udział makroskładników w kaloriach">
      <circle cx="60" cy="60" r={DONUT_R} fill="none" stroke="var(--mk-track)" strokeWidth="14" />
      {segments.map(({ key, len, start }) => (
        <circle key={key} cx="60" cy="60" r={DONUT_R} fill="none" stroke={COLORS[key]} strokeWidth="14"
          strokeDasharray={`${Math.max(len - 2, 0)} ${C}`} strokeDashoffset={-start} transform="rotate(-90 60 60)" />
      ))}
      <text x="60" y="60" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text-h)">{Math.round(nutrition.kcal * portions)}</text>
      <text x="60" y="76" textAnchor="middle" fontSize="10" fill="var(--muted)">kcal</text>
    </svg>
  );
}

const portionWord = (n) => (n === 1 ? 'porcja' : n < 5 ? 'porcje' : 'porcji');

// Karta wybranego przepisu: makro, z czego wyszła trudność, wybór pory i „Ugotuj”
export default function MacroCard({ recipe, plan, defaultSlot, onCook, message }) {
  const [portions, setPortions] = useState(1);
  const [slot, setSlot] = useState(defaultSlot ?? plan[plan.length - 1].key);

  if (!recipe) {
    return <aside className="mk-detail"><p className="mk-muted">Wybierz przepis, żeby zobaczyć makro.</p></aside>;
  }

  const n = recipe.nutrition;
  const d = recipe.difficulty;
  const shares = kcalShares(n);

  return (
    <aside className="mk-detail" aria-live="polite">
      <div className="mk-detail__head">
        <DifficultyBadge level={d.level} />
        <h3>{recipe.title}</h3>
      </div>
      <div className="mk-donut-row">
        <Donut nutrition={n} portions={portions} />
        <div className="mk-legend">
          {MACROS.map(({ key, label }) => (
            <div key={key}>
              <i style={{ background: COLORS[key] }} />
              {label}
              <b>{Math.round(n[key] * portions)} g · {Math.round(shares[key] * 100)}%</b>
            </div>
          ))}
        </div>
      </div>
      <p className="mk-why" title={`Trudność: ${d.total} pkt (czas ${d.time}, składniki ${d.ingredients}, kroki ${d.steps})`}>
        {recipe.readyInMinutes} min · {recipe.ingredientsCount} składników · {recipe.stepsCount} kroków
      </p>
      <div className="mk-field">
        <span className="mk-field__label" id="mk-slot-label">Pora posiłku</span>
        <Select
          id="mk-slot"
          labelledBy="mk-slot-label"
          value={slot}
          onChange={setSlot}
          options={plan.map((s) => ({ value: s.key, label: s.name, note: `cel ${s.target} kcal` }))}
        />
      </div>
      <div className="mk-cook">
        <div className="mk-stepper">
          <button type="button" aria-label="Mniej porcji" onClick={() => setPortions((p) => Math.max(1, p - 1))}>−</button>
          <span>{portions} {portionWord(portions)}</span>
          <button type="button" aria-label="Więcej porcji" onClick={() => setPortions((p) => Math.min(6, p + 1))}>+</button>
        </div>
        <button type="button" className="btn btn--primary mk-cook__btn" onClick={() => onCook(recipe, portions, slot)}>Ugotuj</button>
      </div>
      <p className="mk-toast" role="status">{message}</p>
    </aside>
  );
}
