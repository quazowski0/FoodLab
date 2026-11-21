import { kcalShares } from '../nutrition.js';

// Cienki pasek: udział białka, tłuszczu i węglowodanów w kaloriach
export default function MacroBar({ nutrition }) {
  const s = kcalShares(nutrition);
  return (
    <div className="mk-macrobar" aria-hidden="true">
      <span style={{ width: `${s.protein * 100}%`, background: 'var(--mk-protein)' }} />
      <span style={{ width: `${s.fat * 100}%`, background: 'var(--mk-fat)' }} />
      <span style={{ width: `${s.carbs * 100}%`, background: 'var(--mk-carbs)' }} />
    </div>
  );
}
