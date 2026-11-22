import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeRecipe, formatAmount, scaleRecipe } from '../ingredients.js';
import CookMode from './CookMode.jsx';
import Star from './Star.jsx';
import { fetchRecipeDetails, getCachedDetails, recipeUrl } from '../spoonacular.js';
import { allOnList } from '../shoppingList.js';

const ERRORS = {
  limit: 'Dzienny limit zapytań do Spoonacular został wykorzystany, więc nie pobierzemy tu instrukcji. Limit odnawia się o 1:00 w nocy.',
  quota: 'Dzienny limit zapytań Spoonacular się skończył, więc nie pobierzemy tu instrukcji. Limit odnawia się o 1:00 w nocy.',
  key: 'Klucz API Spoonacular jest nieprawidłowy.',
  timeout: 'Spoonacular nie odpowiada. Spróbuj za chwilę.',
  offline: 'Nie udało się pobrać szczegółów. Sprawdź internet.',
  http: 'Spoonacular zwróciło błąd. Spróbuj za chwilę.',
};

const STATUS = {
  have: { icon: '✓', text: 'masz', cls: 'have' },
  partial: { icon: '◐', text: 'za mało', cls: 'partial' },
  missing: { icon: '✕', text: 'brakuje', cls: 'missing' },
  staple: { icon: '·', text: 'podstawowy', cls: 'staple' },
};

// Szczegóły przepisu: składniki z wyróżnionymi brakami, instrukcja, dodanie braków do listy zakupów
export default function RecipeDetail({ base, pantry, list, onBack, onAddToList, favorite = false, onToggleFavorite, onUpdateFavorite }) {
  // kroki zapisane bez tłumaczenia (np. tłumacz nie odpowiadał) próbujemy przetłumaczyć ponownie
  const needs = base.source === 'spoonacular' && (!base.detailsLoaded || (base.stepsEn?.length > 0 && !base.stepsTranslated));
  const cached = useMemo(() => (needs ? getCachedDetails(base.id)?.recipe ?? null : null), [needs, base.id]);
  const [fetched, setFetched] = useState({ id: null, recipe: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!needs || cached) return undefined;
    const ctrl = new AbortController();
    fetchRecipeDetails(base.id, { signal: ctrl.signal, base })
      .then((recipe) => {
        if (!ctrl.signal.aborted) setFetched({ id: base.id, recipe, error: null });
      })
      .catch((error) => {
        if (!ctrl.signal.aborted) setFetched({ id: base.id, recipe: null, error });
      });
    return () => ctrl.abort();
  }, [base, needs, cached, attempt]);

  const mine = fetched.id === base.id ? fetched : { recipe: null, error: null };
  const full = needs ? cached ?? mine.recipe : base;
  const error = needs && !full ? mine.error : null;
  const loading = needs && !full && !error;

  const original = full ?? base; // do czasu wczytania pokazujemy składniki z listy propozycji
  const baseServings = original.servings || 1;
  const [servings, setServings] = useState(baseServings);
  const [cooking, setCooking] = useState(false);
  const closeCook = useCallback(() => setCooking(false), []);
  const recipe = useMemo(() => scaleRecipe(original, servings / baseServings), [original, servings, baseServings]);
  const analysis = useMemo(() => analyzeRecipe(recipe, pantry), [recipe, pantry]);

  // ulubiony przepis zapisany z listy (bez kroków) uzupełniamy, gdy kroki się wczytają
  useEffect(() => {
    if (favorite && full?.steps?.length && (!base.steps?.length || (full.stepsTranslated && !base.stepsTranslated))) onUpdateFavorite?.(full);
  }, [favorite, full, base.steps, base.stepsTranslated, onUpdateFavorite]);
  const onList = allOnList(list, analysis.missing);
  const { missingCount } = analysis;

  const retry = () => {
    setFetched({ id: null, recipe: null, error: null });
    setAttempt((a) => a + 1);
  };

  return (
    <article className="rc-detail">
      <button type="button" className="rc-btn rc-btn--ghost rc-btn--sm rc-back" onClick={onBack}>← Wróć do propozycji</button>

      <header className="rc-detail__head">
        {recipe.image ? <img className="rc-detail__img" src={recipe.image} alt="" /> : null}
        <div>
          <h2 className="rc-detail__title">{recipe.title}</h2>
          <ul className="rc-facts">
            {recipe.readyInMinutes ? <li>{recipe.readyInMinutes} min</li> : null}
            {recipe.nutrition ? <li>{recipe.nutrition.kcal} kcal / porcja</li> : null}
            <li>masz {analysis.haveCount}/{analysis.total} składników</li>
          </ul>
          <div className="rc-detail__tools">
            <div className="rc-servings" role="group" aria-label="Liczba porcji">
              <button type="button" aria-label="Mniej porcji" onClick={() => setServings((x) => Math.max(1, x - 1))} disabled={servings <= 1}>−</button>
              <span><b>{servings}</b> {servings === 1 ? 'porcja' : servings < 5 ? 'porcje' : 'porcji'}</span>
              <button type="button" aria-label="Więcej porcji" onClick={() => setServings((x) => Math.min(20, x + 1))}>+</button>
            </div>
            {onToggleFavorite && (
              <button type="button" className={`rc-btn rc-btn--ghost rc-btn--sm rc-fav-btn ${favorite ? 'is-on' : ''}`} aria-pressed={favorite} onClick={() => onToggleFavorite(full ?? base)}>
                <Star filled={favorite} /> {favorite ? 'W ulubionych' : 'Do ulubionych'}
              </button>
            )}
          </div>
          {recipe.translated && <p className="rc-muted rc-tl">Tłumaczenie automatyczne z angielskiego, może zawierać błędy.</p>}
        </div>
      </header>

      <div className="rc-detail__cols">
        <section aria-labelledby="rc-ing-title">
          <h3 id="rc-ing-title">Składniki</h3>
          <ul className="rc-ingredients">
            {analysis.rows.map(({ ingredient, status, shortfall }, i) => {
              const s = STATUS[status];
              return (
                <li key={`${ingredient.name}-${i}`} className={`rc-ing rc-ing--${s.cls}`}>
                  <span className="rc-ing__icon" aria-hidden="true">{s.icon}</span>
                  <span className="rc-ing__name">
                    {ingredient.name}
                    {formatAmount(ingredient.amount, ingredient.unit) && (
                      <span className="rc-muted"> · {formatAmount(ingredient.amount, ingredient.unit)}</span>
                    )}
                  </span>
                  <span className="rc-ing__status">
                    {s.text}
                    {shortfall ? `: ${formatAmount(shortfall.amount, shortfall.unit)}` : ''}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="rc-detail__actions">
            {missingCount > 0 ? (
              <button type="button" className="rc-btn rc-btn--primary" onClick={() => onAddToList(recipe.title, analysis.missing)} disabled={onList}>
                {onList ? 'Braki są na liście zakupów' : `Dodaj braki do listy zakupów (${missingCount})`}
              </button>
            ) : (
              <p className="rc-note rc-note--ok">Masz wszystkie składniki. Smacznego!</p>
            )}
            {onList && <Link to="/przepisy?zakladka=zakupy" className="rc-link">Zobacz listę zakupów</Link>}
          </div>
        </section>

        <section aria-labelledby="rc-steps-title">
          <h3 id="rc-steps-title">Instrukcja</h3>
          {full?.stepMeta?.length > 0 && <StepSummary meta={full.stepMeta} />}
          {full?.steps?.length > 0 && (
            <button type="button" className="rc-btn rc-btn--primary rc-cook-btn" onClick={() => setCooking(true)}>Tryb gotowania krok po kroku</button>
          )}
          {loading && (
            <div aria-busy="true" aria-label="Wczytywanie instrukcji">
              <div className="rc-skeleton" /><div className="rc-skeleton" /><div className="rc-skeleton" />
            </div>
          )}
          {error && (
            <div className="rc-notice rc-notice--error" role="alert">
              <span>{ERRORS[error.kind] ?? ERRORS.offline}</span>
              {['offline', 'timeout', 'http'].includes(error.kind) && (
                <button type="button" className="rc-btn rc-btn--ghost rc-btn--sm" onClick={retry}>Spróbuj ponownie</button>
              )}
            </div>
          )}
          {error && (
            <a className="rc-btn rc-btn--ghost rc-btn--sm rc-source" href={recipeUrl(base)} target="_blank" rel="noreferrer">
              Otwórz instrukcję na stronie przepisu (po angielsku)
            </a>
          )}
          {full && (full.steps.length ? (
            <ol className="rc-steps">
              {full.steps.map((step, i) => {
                const m = full.stepMeta?.[i];
                const tags = [
                  m?.minutes && `${m.minutes} min`,
                  m?.tempC && `${m.tempC}°C`,
                  ...(m?.equipment ?? []),
                ].filter(Boolean);
                return (
                  <li key={i}>
                    <p className="rc-step__text">{step}</p>
                    {tags.length > 0 && (
                      <p className="rc-step__tags">
                        {tags.map((t, j) => (
                          <span key={t} className={`rc-step__tag${j < (m.minutes ? 1 : 0) + (m.tempC ? 1 : 0) ? ' rc-step__tag--key' : ''}`}>{t}</span>
                        ))}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="rc-muted">Ten przepis nie ma opisanych kroków.</p>
          ))}
        </section>
      </div>
      {cooking && full && <CookMode title={recipe.title} steps={full.steps} meta={full.stepMeta} onClose={closeCook} />}
    </article>
  );
}

// Podsumowanie nad krokami: łączny czas z kroków, temperatura piekarnika i potrzebny sprzęt
function StepSummary({ meta }) {
  const minutes = meta.reduce((sum, m) => sum + (m.minutes ?? 0), 0);
  const temps = [...new Set(meta.map((m) => m.tempC).filter(Boolean))];
  const equipment = [...new Set(meta.flatMap((m) => m.equipment))];
  if (!minutes && !temps.length && !equipment.length) return null;
  return (
    <dl className="rc-stepsum">
      {minutes > 0 && (<div><dt>Czas w krokach</dt><dd>{minutes} min</dd></div>)}
      {temps.length > 0 && (<div><dt>Temperatura</dt><dd>{temps.map((t) => `${t}°C`).join(', ')}</dd></div>)}
      {equipment.length > 0 && (<div><dt>Sprzęt</dt><dd>{equipment.join(', ')}</dd></div>)}
    </dl>
  );
}
