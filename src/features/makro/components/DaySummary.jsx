import { MACROS, fmt } from '../nutrition.js';

const RING_R = 82;
const COLORS = { protein: 'var(--mk-protein)', fat: 'var(--mk-fat)', carbs: 'var(--mk-carbs)' };

// Góra zakładki „Dziś”: pierścień kalorii, trzy paski makro i skrót do następnego posiłku
export default function DaySummary({ totals, goals, next, onFindMeal }) {
  const C = 2 * Math.PI * RING_R;
  const over = totals.kcal > goals.kcal;
  const frac = Math.min(totals.kcal / (goals.kcal || 1), 1);

  return (
    <div className="mk-summary">
      <svg className="mk-ring" viewBox="0 0 200 200" role="img" aria-label={`Zjedzono ${totals.kcal} z ${goals.kcal} kcal`}>
        <circle cx="100" cy="100" r={RING_R} fill="none" stroke="var(--mk-track)" strokeWidth="16" />
        <circle cx="100" cy="100" r={RING_R} fill="none" stroke={over ? 'var(--mk-hard)' : 'var(--accent)'} strokeWidth="16"
          strokeLinecap="round" transform="rotate(-90 100 100)" strokeDasharray={`${frac * C} ${C}`} className="mk-ring__arc" />
        <text x="100" y="92" textAnchor="middle" fontSize="36" fontWeight="800" fill="var(--text-h)">{fmt(Math.abs(goals.kcal - totals.kcal))}</text>
        <text x="100" y="116" textAnchor="middle" fontSize="13" fill="var(--muted)">{over ? 'kcal ponad cel' : 'kcal zostało'}</text>
        <text x="100" y="136" textAnchor="middle" fontSize="12" fill="var(--muted)">{fmt(totals.kcal)} / {fmt(goals.kcal)}</text>
      </svg>

      <div className="mk-bars">
        {MACROS.map(({ key, label }) => (
          <div key={key} className="mk-bar-row">
            <div className="mk-bar-label"><b>{label}</b><span>{Math.round(totals[key])} / {goals[key]} g</span></div>
            <div className="mk-bar"><i style={{ width: `${Math.min((totals[key] / (goals[key] || 1)) * 100, 100)}%`, background: COLORS[key] }} /></div>
          </div>
        ))}
        {next.slot && (
          <div className="mk-next">
            <span>Następny posiłek: <b>{next.slot.name.toLowerCase()}</b>, do {fmt(next.kcal)} kcal</span>
            <button type="button" className="btn btn--primary mk-next__btn" onClick={onFindMeal}>Znajdź danie</button>
          </div>
        )}
      </div>
    </div>
  );
}
