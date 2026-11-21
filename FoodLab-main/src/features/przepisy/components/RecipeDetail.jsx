import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeRecipe, formatAmount } from '../ingredients.js';
import { fetchRecipeDetails, getCachedDetails } from '../spoonacular.js';
import { allOnList } from '../shoppingList.js';

const ERRORS = {
  limit: 'Dzienny limit zapytań do Spoonacular został wykorzystany. Szczegóły będą dostępne jutro.',
  quota: 'Limit zapytań Spoonacular został wyczerpany. Spróbuj jutro.',
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
export default function RecipeDetail({ base, pantry, list, onBack, onAddToList }) {
  const needs = base.source === 'spoonacular' && !base.detailsLoaded;
  const cached = useMemo(() => (needs ? getCachedDetails(base.id)?.recipe ?? null : null), [needs, base.id]);
  const [fetched, setFetched] = useState({ id: null, recipe: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!needs || cached) return undefined;
    const ctrl = new AbortController();
    fetchRecipeDetails(base.id, { signal: ctrl.signal })
      .then((recipe) => setFetched({ id: base.id, recipe, error: null }))
      .catch((error) => {
        if (!ctrl.signal.aborted) setFetched({ id: base.id, recipe: null, error });
      });
    return () => ctrl.abort();
  }, [base.id, needs, cached, attempt]);

  const mine = fetched.id === base.id ? fetched : { recipe: null, error: null };
  const full = needs ? cached ?? mine.recipe : base;
  const error = needs && !full ? mine.error : null;
  const loading = needs && !full && !error;

  const recipe = full ?? base; // do czasu wczytania pokazujemy składniki z listy propozycji
  const analysis = useMemo(() => analyzeRecipe(recipe, pantry), [recipe, pantry]);
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
            {recipe.servings ? <li>{recipe.servings} {recipe.servings === 1 ? 'porcja' : 'porcje'}</li> : null}
            {recipe.nutrition ? <li>{recipe.nutrition.kcal} kcal / porcja</li> : null}
            <li>masz {analysis.haveCount}/{analysis.total} składników</li>
          </ul>
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
          {full && (full.steps.length ? (
            <ol className="rc-steps">
              {full.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          ) : (
            <p className="rc-muted">Ten przepis nie ma opisanych kroków.</p>
          ))}
        </section>
      </div>
    </article>
  );
}
