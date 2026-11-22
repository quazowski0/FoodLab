import { useState } from 'react';
import Star from './Star.jsx';
// Kafelek propozycji: ile składników już masz i ile brakuje
export default function RecipeCard({ recipe, analysis, onSelect, favorite = false, onToggleFavorite }) {
  const { total, missingCount, haveCount: have } = analysis;
  const pct = total ? Math.round((have / total) * 100) : 0;
  const complete = missingCount === 0;
  const [broken, setBroken] = useState(false); // zdjęcie ze Spoonacular czasem nie istnieje

  return (
    <li className="rc-card-wrap">
      {onToggleFavorite && (
        <button type="button" className={`rc-fav ${favorite ? 'is-on' : ''}`} aria-pressed={favorite}
          aria-label={favorite ? `Usuń z ulubionych: ${recipe.title}` : `Dodaj do ulubionych: ${recipe.title}`}
          onClick={() => onToggleFavorite(recipe)}>
          <Star filled={favorite} />
        </button>
      )}
      <button type="button" className="rc-card" onClick={() => onSelect(recipe.id)}>
        {recipe.image && !broken ? (
          <img className="rc-card__img" src={recipe.image} alt="" loading="lazy" onError={() => setBroken(true)} />
        ) : (
          <span className="rc-card__img rc-card__img--empty" aria-hidden="true">{recipe.title.charAt(0)}</span>
        )}
        <span className="rc-card__body">
          <span className="rc-card__title">{recipe.title}</span>
          <span className="rc-card__match">
            masz {have}/{total} składników
          </span>
          <span className="rc-meter" aria-hidden="true">
            <i className={`rc-meter__fill ${complete ? 'is-full' : ''}`} style={{ width: `${pct}%` }} />
          </span>
          <span className="rc-card__foot">
            <span className={`rc-badge ${complete ? 'rc-badge--ok' : 'rc-badge--miss'}`}>
              {complete ? 'Masz wszystko' : `Brakuje ${missingCount}`}
            </span>
            <span className="rc-muted">
              {[recipe.readyInMinutes && `${recipe.readyInMinutes} min`, recipe.nutrition && `${recipe.nutrition.kcal} kcal`].filter(Boolean).join(' · ')}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}
