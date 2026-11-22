import { useMemo, useState } from 'react';
import '../features/makro/makro.css';
import { SAMPLE_RECIPES } from '../features/makro/sampleRecipes.js';
import { analyzeRecipe, getCachedRecipes, getLatestSuggestions, pantryUsage, scaleRecipe } from '../features/przepisy';
import { getFavorites } from '../features/przepisy/favorites.js';
import { formatQuantity } from '../features/spizarnia/pantryStore.js';
import { usePantry } from '../features/spizarnia';
import { usedCount } from '../features/przepisy/ingredients.js';
import { Link } from 'react-router-dom';
import { getDifficulty } from '../features/makro/difficulty.js';
import { DEFAULT_FILTERS, KCAL_NO_LIMIT, filterRecipes } from '../features/makro/filters.js';
import { DEFAULT_PROFILE, calcGoals } from '../features/makro/goals.js';
import { buildPlan, nextBudget, slotBudget, slotForCategory, SLOTS } from '../features/makro/mealPlan.js';
import { fmt, proteinShare, sumMeals } from '../features/makro/nutrition.js';
import { useLocalStorage } from '../features/makro/storage.js';
import { CATEGORIES, SLOT_TO_CATEGORY } from '../features/makro/categories.js';
import { useDailyLog } from '../features/makro/useDailyLog.js';
import RecipeFilters from '../features/makro/components/RecipeFilters.jsx';
import RecipeCard from '../features/makro/components/RecipeCard.jsx';
import MacroCard from '../features/makro/components/MacroCard.jsx';
import DaySummary from '../features/makro/components/DaySummary.jsx';
import DayTimeline from '../features/makro/components/DayTimeline.jsx';
import WeekChart from '../features/makro/components/WeekChart.jsx';
import GoalCalculator from '../features/makro/components/GoalCalculator.jsx';
import Onboarding from '../features/makro/components/Onboarding.jsx';

// Podpowiedź pod kartą: jak danie wpasuje się w resztę dnia
function recipeHint(n, totals, goals) {
  const remKcal = goals.kcal - totals.kcal;
  const remFat = goals.fat - totals.fat;
  if (n.kcal > remKcal) return { tone: 'bad', text: `Przekroczy dzienny limit o ${fmt(n.kcal - Math.max(remKcal, 0))} kcal` };
  if (n.fat > remFat) return { tone: 'warn', text: `Dużo tłuszczu: cel przekroczony o ${fmt(n.fat - Math.max(remFat, 0))} g` };
  if (proteinShare(n) >= 0.25) return { tone: 'good', text: `Pokryje ${Math.round((n.protein / goals.protein) * 100)}% dziennego białka` };
  return null; // neutralnych podpowiedzi nie pokazujemy, żeby nie zaśmiecać kart
}

const TABS = [
  { id: 'dzis', label: 'Dziś' },
  { id: 'przepisy', label: 'Przepisy' },
  { id: 'cele', label: 'Cele' },
];

// 0,05 l czyta się gorzej niż 50 ml
const usageLabel = (amount, unit) =>
  (unit === 'l' || unit === 'kg') && amount < 1 ? `${Math.round(amount * 1000)} ${unit === 'l' ? 'ml' : 'g'}` : formatQuantity(amount, unit);

const nowHHMM = () => new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

export default function Summary() {
  const [storedProfile, setProfile] = useLocalStorage('foodlab.cele', DEFAULT_PROFILE);
  const [storedFilters, setFilters] = useLocalStorage('foodlab.filtry', DEFAULT_FILTERS);
  const profile = { ...DEFAULT_PROFILE, ...storedProfile };
  const filters = { ...DEFAULT_FILTERS, ...storedFilters };
  const { meals, addMeal, removeMeal, lastDays } = useDailyLog();
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useLocalStorage('foodlab.zakladka', 'dzis');
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(null); // null = kategoria pasująca do następnego posiłku

  const { available, changeQuantity } = usePantry();
  const [usage, setUsage] = useState(null); // co odjąć ze spiżarni po „Ugotuj”
  const [fromPantry, setFromPantry] = useLocalStorage('foodlab.zmoich', false);

  // prawdziwe przepisy ze Spoonacular: propozycje z zakładki Przepisy + otwarte szczegóły.
  // Przykładowe pokazujemy tylko wtedy, gdy nic jeszcze nie pobrano.
  const real = useMemo(() => {
    const seen = new Set();
    return [...getLatestSuggestions(), ...getFavorites(), ...getCachedRecipes()]
      .filter((r) => r?.nutrition && r.title && (seen.has(r.id) ? false : seen.add(r.id)))
      .map((r) => {
        const cats = r.categories?.length ? r.categories : ['obiad'];
        return {
          ...r,
          readyInMinutes: r.readyInMinutes || 30,
          ingredientsCount: r.ingredientsCount || r.ingredients?.length || 0,
          stepsCount: r.stepsCount || r.steps?.length || 0,
          categories: r.dessert && !cats.includes('desery') ? ['desery'] : cats,
        };
      });
  }, []);
  const usingSamples = real.length === 0;

  // ile składników z każdego przepisu masz w spiżarni (przykładowe nie mają listy składników)
  const recipes = useMemo(() => {
    const base = usingSamples ? SAMPLE_RECIPES : real;
    return base.map((r) => {
      const analysis = r.ingredients?.length ? analyzeRecipe(r, available) : null;
      return { ...r, difficulty: getDifficulty(r), pantry: analysis && { used: usedCount(analysis), total: analysis.total, missing: analysis.missingCount } };
    });
  }, [real, usingSamples, available]);
  const MAX_MISSING = 2; // „Z tego, co mam”: dokupujesz najwyżej 2 składniki (przyprawy się nie liczą)
  const fitsPantry = (r) => r.pantry?.used > 0 && r.pantry.missing <= MAX_MISSING;
  const pantryMatches = recipes.filter(fitsPantry).length;
  const onlyPantry = fromPantry && !usingSamples;

  const goals = calcGoals(profile);
  const plan = buildPlan(goals.kcal, profile.meals);
  const totals = sumMeals(meals);
  const next = nextBudget(meals, plan, goals.kcal - totals.kcal);

  const nowCategory = SLOT_TO_CATEGORY[next.slot?.key] ?? null;
  const activeCategory = category ?? nowCategory ?? 'wszystkie';
  // pora, do której dopisze się danie, i jej limit: zależy od wybranej kategorii (np. Obiad -> obiad)
  const targetSlotKey = activeCategory === 'wszystkie'
    ? next.slot?.key
    : slotForCategory(activeCategory, SLOT_TO_CATEGORY, meals, plan, next.slot?.key);
  const budget = targetSlotKey ? slotBudget(targetSlotKey, meals, plan, goals.kcal - totals.kcal) : next;
  const kcalLimit = filters.fitDay ? budget.kcal : filters.maxKcal >= KCAL_NO_LIMIT ? Infinity : filters.maxKcal;
  const byPantry = (a, b) => a.pantry.missing - b.pantry.missing || b.pantry.used - a.pantry.used;
  const filtered = onlyPantry
    ? filterRecipes(recipes.filter(fitsPantry), filters, kcalLimit).sort(byPantry)
    : filterRecipes(recipes, filters, kcalLimit);
  const inCategory = (id) => filtered.filter((r) => r.categories.includes(id));
  // kategoria dobrana automatycznie do pory dnia, ale pusta: pokazujemy wszystko zamiast pustej listy
  const shownCategory = category === null && activeCategory !== 'wszystkie' && !inCategory(activeCategory).length ? 'wszystkie' : activeCategory;
  const visible = shownCategory === 'wszystkie' ? filtered : inCategory(shownCategory);
  // w widoku „Wszystkie” każdy przepis tylko raz, w swojej pierwszej kategorii
  const groups = CATEGORIES.map((c) => ({ ...c, items: filtered.filter((r) => r.categories[0] === c.id) })).filter((g) => g.items.length);
  const selected = visible.find((r) => r.id === selectedId) ?? visible[0] ?? null;

  const cook = (recipe, portions, slot) => {
    const n = recipe.nutrition;
    const meal = {
      id: `${Date.now()}-${recipe.id}`,
      recipeId: recipe.id,
      slot,
      title: recipe.title,
      portions,
      at: nowHHMM(),
      // kopia makro, a nie samo id: bilans zostaje, nawet gdy przepis zniknie z cache
      kcal: Math.round(n.kcal * portions),
      protein: Math.round(n.protein * portions),
      fat: Math.round(n.fat * portions),
      carbs: Math.round(n.carbs * portions),
    };
    addMeal(meal);
    setMessage(`${SLOTS[slot].name}: dodano ${meal.kcal} kcal do bilansu dnia`);
    // składniki z przepisu (ilości na całe danie) przeliczamy na zjedzone porcje
    const rows = recipe.ingredients?.length ? pantryUsage(scaleRecipe(recipe, portions / (recipe.servings || 1)), available) : [];
    setUsage(rows.length ? { recipeId: recipe.id, rows, done: false } : null);
  };

  const applyUsage = () => {
    usage.rows.forEach((r) => changeQuantity(r.item.id, -r.amount));
    setUsage({ ...usage, done: true });
  };

  const selectRecipe = (id) => {
    setSelectedId(id);
    setUsage(null);
    setMessage('');
  };

  const findMeal = () => {
    setFilters({ ...filters, fitDay: true, preset: null });
    setCategory(null);
    setTab('przepisy');
  };

  // Ankieta na start: dopóki cele nie są ustawione, albo gdy użytkownik chce ją wypełnić od nowa
  if (!profile.done || editing) {
    return (
      <div className="mk">
        <Onboarding
          profile={profile}
          onCancel={profile.done ? () => setEditing(false) : null}
          onFinish={(p) => {
            setProfile(p);
            setEditing(false);
            setTab('dzis');
          }}
        />
      </div>
    );
  }

  return (
    <div className="mk">
      <header className="mk-head">
        <span className="kicker">Filtry i makro</span>
        <h1 className="mk-title">Twój dzień</h1>
      </header>

      <div className="mk-tabs" role="tablist" aria-label="Widoki">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`mk-tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`mk-pane-${t.id}`}
            className="mk-tab" onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dzis' && (
        <section className="mk-panel" role="tabpanel" id="mk-pane-dzis" aria-labelledby="mk-tab-dzis">
          <DaySummary totals={totals} goals={goals} next={next} onFindMeal={findMeal} />
          <DayTimeline plan={plan} meals={meals} next={next} onRemove={removeMeal} />
        </section>
      )}

      {tab === 'przepisy' && (
        <section className="mk-panel" role="tabpanel" id="mk-pane-przepisy" aria-labelledby="mk-tab-przepisy">
          {!usingSamples && (
            <div className="mk-source" role="group" aria-label="Źródło przepisów">
              <button type="button" className="mk-source__btn" aria-pressed={!onlyPantry} onClick={() => setFromPantry(false)}>
                Wszystkie przepisy <span>{recipes.length}</span>
              </button>
              <button type="button" className="mk-source__btn" aria-pressed={onlyPantry} onClick={() => setFromPantry(true)}
                title="Przepisy z produktów ze spiżarni, w których brakuje najwyżej 2 składników">
                Z tego, co mam <span>{pantryMatches}</span>
              </button>
            </div>
          )}
          <div className="mk-cats" role="group" aria-label="Kategorie przepisów">
            {[{ id: 'wszystkie', label: 'Wszystkie' }, ...CATEGORIES].map((c) => {
              const count = c.id === 'wszystkie' ? filtered.length : inCategory(c.id).length;
              return (
                <button key={c.id} type="button" className="mk-cat" aria-pressed={shownCategory === c.id} onClick={() => setCategory(c.id)}>
                  {c.label}
                  <span className="mk-cat__count">{count}</span>
                  {c.id === nowCategory && <span className="mk-cat__now">teraz</span>}
                </button>
              );
            })}
          </div>

          <RecipeFilters filters={filters} onChange={setFilters} next={budget} />

          <div className="mk-recipes">
            <div className="mk-groups">
              {visible.length === 0 && (
                <div className="mk-empty">
                  {onlyPantry
                    ? 'Ze spiżarni nie da się zrobić nic z tej kategorii (brakuje więcej niż 2 składników). Wyłącz „Z tego, co mam” albo dodaj produkty do spiżarni.'
                    : filters.fitDay
                    ? `W tej kategorii nic nie mieści się w ${fmt(budget.kcal)} kcal. Wyłącz filtr dnia albo wybierz inną kategorię.`
                    : 'Brak przepisów w tej kategorii dla wybranych filtrów.'}
                </div>
              )}
              {shownCategory === 'wszystkie'
                ? groups.map((g) => (
                    <div key={g.id} className="mk-group">
                      <h3 className="mk-group__title">{g.label}<span>{g.items.length}</span></h3>
                      <div className="mk-grid">
                        {g.items.map((r) => (
                          <RecipeCard key={r.id} recipe={r} selected={selected?.id === r.id} hint={recipeHint(r.nutrition, totals, goals)} onSelect={selectRecipe} />
                        ))}
                      </div>
                    </div>
                  ))
                : visible.length > 0 && (
                    <div className="mk-grid">
                      {visible.map((r) => (
                        <RecipeCard key={r.id} recipe={r} selected={selected?.id === r.id} hint={recipeHint(r.nutrition, totals, goals)} onSelect={selectRecipe} />
                      ))}
                    </div>
                  )}
              {usingSamples ? (
                <p className="mk-note">
                  Na razie przykładowe przepisy. Wejdź w <Link to="/przepisy">Przepisy</Link> i kliknij „Znajdź przepisy”, a pojawią się tu prawdziwe dania dobrane do Twojej spiżarni.
                </p>
              ) : (
                <p className="mk-note">
                  Dania ze Spoonacular z ostatniego wyszukiwania w <Link to="/przepisy">Przepisach</Link>. Kalorie i makro na 1 porcję.
                </p>
              )}
            </div>
            <MacroCard
              key={`${selected?.id}-${targetSlotKey ?? 'all'}-${profile.meals}`}
              recipe={selected}
              plan={plan}
              defaultSlot={targetSlotKey}
              onCook={cook}
              message={message}
            >
              {usage && usage.recipeId === selected?.id && (
                <div className="mk-usage">
                  {usage.done ? (
                    <p className="mk-usage__done">Odjęte ze spiżarni. <Link to="/spizarnia">Zobacz spiżarnię</Link></p>
                  ) : (
                    <>
                      <p className="mk-usage__title">Zużyjesz ze spiżarni (szacunkowo):</p>
                      <ul>
                        {usage.rows.map((r) => (
                          <li key={r.item.id}><span>{r.item.name}</span><b>−{usageLabel(r.amount, r.item.unit)}</b></li>
                        ))}
                      </ul>
                      <div className="mk-usage__actions">
                        <button type="button" className="btn btn--primary" onClick={applyUsage}>Odejmij ze spiżarni</button>
                        <button type="button" className="btn btn--ghost" onClick={() => setUsage(null)}>Nie teraz</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </MacroCard>
          </div>
        </section>
      )}

      {tab === 'cele' && (
        <section className="mk-panel" role="tabpanel" id="mk-pane-cele" aria-labelledby="mk-tab-cele">
          <GoalCalculator profile={profile} goals={goals} plan={plan} onEdit={() => setEditing(true)} />
          <div className="mk-week-box">
            <h2 className="mk-h3">Ostatnie 7 dni</h2>
            <WeekChart days={lastDays(7)} goalKcal={goals.kcal} />
          </div>
        </section>
      )}
    </div>
  );
}
