import { fmt } from '../nutrition.js';
import { slotOf } from '../mealPlan.js';

// Pory dnia z posiłkami. Najbliższy posiłek jest podświetlony.
export default function DayTimeline({ plan, meals, next, onRemove }) {
  return (
    <div className="mk-timeline">
      {plan.map((s) => {
        const slotMeals = meals.filter((m) => slotOf(m, plan) === s.key);
        const sum = slotMeals.reduce((acc, m) => acc + m.kcal, 0);
        const isNext = next.slot?.key === s.key;
        const over = sum > s.target * 1.15;
        return (
          <div key={s.key} className={`mk-slot ${isNext ? 'mk-slot--next' : ''}`}>
            <div className="mk-slot__head">
              <b>{s.name}</b>
              <span>{fmt(sum)} / {fmt(s.target)} kcal</span>
            </div>
            <div className="mk-slot__bar"><i style={{ width: `${Math.min((sum / (s.target || 1)) * 100, 100)}%`, background: over ? 'var(--mk-mid)' : 'var(--accent)' }} /></div>
            {slotMeals.map((m) => (
              <div key={m.id} className="mk-slot__meal">
                <span className="mk-slot__title">{m.title}</span>
                <span className="mk-slot__kcal">{m.kcal} kcal</span>
                <button type="button" className="mk-slot__del" aria-label={`Usuń ${m.title}`} onClick={() => onRemove(m.id)}>×</button>
              </div>
            ))}
            {!slotMeals.length && isNext && <span className="mk-slot__hint">teraz</span>}
          </div>
        );
      })}
    </div>
  );
}
