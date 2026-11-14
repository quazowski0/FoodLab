import DifficultyBadge from './DifficultyBadge.jsx';
import MacroBar from './MacroBar.jsx';

export default function RecipeCard({ recipe, selected, hint, onSelect }) {
  const n = recipe.nutrition;
  return (
    <button type="button" className="mk-card" aria-current={selected} onClick={() => onSelect(recipe.id)}>
      <div className="mk-card__top">
        <h3>{recipe.title}</h3>
        <DifficultyBadge level={recipe.difficulty.level} />
      </div>
      <div className="mk-card__kcal">
        {n.kcal} <small>kcal · {recipe.readyInMinutes} min</small>
      </div>
      <MacroBar nutrition={n} />
      {hint && <div className={`mk-hint mk-hint--${hint.tone}`}>{hint.text}</div>}
    </button>
  );
}
