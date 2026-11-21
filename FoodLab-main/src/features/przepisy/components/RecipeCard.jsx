import { usedCount } from '../ingredients.js';

// Kafelek propozycji: ile składników już masz i ile brakuje
export default function RecipeCard({ recipe, analysis, onSelect }) {
  const { total, missingCount } = analysis;
  const have = total - missingCount;
  const pct = total ? Math.round((have / total) * 100) : 0;
  const complete = missingCount === 0;
  const used = usedCount(analysis);

  return (
    <li>
      <button type="button" className="rc-card" onClick={() => onSelect(recipe.id)}>
        {recipe.image ? (
          <img className="rc-card__img" src={recipe.image} alt="" loading="lazy" />
        ) : (
          <span className="rc-card__img rc-card__img--empty" aria-hidden="true">{recipe.title.charAt(0)}</span>
        )}
        <span className="rc-card__body">
          <span className="rc-card__title">{recipe.title}</span>
          <span className="rc-card__match">
            masz {used === total ? have : used}/{total} składników
          </span>
          <span className="rc-meter" aria-hidden="true">
            <i className={`rc-meter__fill ${complete ? 'is-full' : ''}`} style={{ width: `${pct}%` }} />
          </span>
          <span className="rc-card__foot">
            <span className={`rc-badge ${complete ? 'rc-badge--ok' : 'rc-badge--miss'}`}>
              {complete ? 'Masz wszystko' : `Brakuje ${missingCount}`}
            </span>
            {recipe.readyInMinutes ? <span className="rc-muted">{recipe.readyInMinutes} min</span> : null}
          </span>
        </span>
      </button>
    </li>
  );
}
