import { fmt } from '../nutrition.js';
import { ACTIVITY_LEVELS, GOAL_TYPES } from '../goals.js';

const dec = (x) => String(x).replace('.', ',');

// Zakładka „Cele”: podsumowanie odpowiedzi z ankiety i wyliczony cel
export default function GoalCalculator({ profile, goals, plan, onEdit }) {
  const activity = ACTIVITY_LEVELS.find((a) => a.value === Number(profile.activity));
  const goal = GOAL_TYPES.find((g) => g.value === profile.goal);

  return (
    <div className="mk-calc">
      <div className="mk-answers">
        <h2 className="mk-h3">Twoje odpowiedzi</h2>
        <dl>
          <div><dt>Płeć i wiek</dt><dd>{profile.sex === 'k' ? 'Kobieta' : 'Mężczyzna'}, {goals.age} lat</dd></div>
          <div><dt>Waga i wzrost</dt><dd>{goals.weight} kg, {goals.height} cm</dd></div>
          <div><dt>Aktywność</dt><dd>{activity?.label}</dd></div>
          <div><dt>Cel</dt><dd>{goal?.label}</dd></div>
          <div><dt>Posiłki</dt><dd>{profile.meals} dziennie</dd></div>
        </dl>
        <button type="button" className="btn btn--ghost mk-ob__btn" onClick={onEdit}>Wypełnij ankietę od nowa</button>
      </div>

      <div className="mk-calc__out">
        <span className="mk-field__label">Dzienny cel</span>
        <div className="mk-big">{fmt(goals.kcal)} <small>kcal</small></div>
        <div className="mk-split3">
          <div><i style={{ background: 'var(--mk-protein)' }} /><b>{goals.protein} g</b><span>białko</span></div>
          <div><i style={{ background: 'var(--mk-fat)' }} /><b>{goals.fat} g</b><span>tłuszcze</span></div>
          <div><i style={{ background: 'var(--mk-carbs)' }} /><b>{goals.carbs} g</b><span>węglowodany</span></div>
        </div>
        <span className="mk-field__label">Podział na posiłki</span>
        <div className="mk-plan">
          {plan.map((s) => (
            <div key={s.key}><span className="mk-plan__name">{s.name}</span><span>{s.pct}%</span><b>{fmt(s.target)} kcal</b></div>
          ))}
        </div>
        <details className="mk-formula">
          <summary>Jak to jest liczone</summary>
          <span>BMR = 10×{goals.weight} + 6,25×{goals.height} − 5×{goals.age} {profile.sex === 'k' ? '− 161' : '+ 5'} = {Math.round(goals.bmr)}</span>
          <span>TDEE = {Math.round(goals.bmr)} × {dec(goals.activity)} = {Math.round(goals.tdee)}</span>
          <span>cel = {Math.round(goals.tdee)} {goals.delta ? `${goals.delta > 0 ? '+' : '−'} ${Math.abs(goals.delta)}` : ''} ≈ {goals.kcal} kcal</span>
          <span>białko {dec(goals.proteinPerKg)} g/kg · tłuszcze 25% kcal · reszta węglowodany</span>
        </details>
      </div>
    </div>
  );
}
