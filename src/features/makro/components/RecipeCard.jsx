import DifficultyBadge from './DifficultyBadge.jsx';
import RecipeImage from './RecipeImage.jsx';

export default function RecipeCard({ recipe, selected, hint, onSelect }) {
  const n = recipe.nutrition;
  const p = recipe.pantry;
  return (
    <button type="button" className="mk-card" aria-current={selected} onClick={() => onSelect(recipe.id)}>
      <span className="mk-card__media">
        <RecipeImage recipe={recipe} className="mk-card__img" />
        <DifficultyBadge level={recipe.difficulty.level} />
      </span>
      <span className="mk-card__body">
        <h3 className="mk-card__title">{recipe.title}</h3>
        <span className="mk-card__facts">
          <span><b>{n.kcal}</b> kcal</span>
          <span><b>{recipe.readyInMinutes}</b> min</span>
        </span>
        {p?.used > 0 && (
          <span className={`mk-card__pantry${p.missing === 0 ? ' is-ok' : ''}`}>
            {p.missing === 0 ? 'Masz wszystkie składniki' : `Masz ${p.used} z ${p.total} składników`}
          </span>
        )}
        <span className="mk-card__macros">
          <span style={{ '--c': 'var(--mk-protein)' }}><b>{n.protein} g</b>białko</span>
          <span style={{ '--c': 'var(--mk-fat)' }}><b>{n.fat} g</b>tłuszcz</span>
          <span style={{ '--c': 'var(--mk-carbs)' }}><b>{n.carbs} g</b>węglowodany</span>
        </span>
        {hint && <span className={`mk-hint mk-hint--${hint.tone}`}>{hint.text}</span>}
      </span>
    </button>
  );
}
