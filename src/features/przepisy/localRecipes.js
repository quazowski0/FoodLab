// Przepisy demonstracyjne, używane gdy nie ma klucza Spoonacular (VITE_SPOONACULAR_KEY).
// Ten sam kształt co przepisy z API po normalizacji, więc reszta modułu nie widzi różnicy.
const r = (id, title, readyInMinutes, servings, ingredients, steps) => ({
  id: `demo-${id}`,
  source: 'demo',
  title,
  image: '',
  readyInMinutes,
  servings,
  ingredients: ingredients.map(([name, amount, unit]) => ({ name, amount, unit })),
  steps,
});

export const LOCAL_RECIPES = [
  r(1, 'Jajecznica ze szczypiorkiem', 10, 1, [
    ['jajka', 3, 'szt'], ['masło', 10, 'g'], ['szczypiorek', 1, 'szt'], ['sól', 1, 'szt'],
  ], [
    'Rozpuść masło na patelni na średnim ogniu.',
    'Wbij jajka, dopraw solą i smaż, delikatnie mieszając, aż się zetną.',
    'Posyp posiekanym szczypiorkiem i od razu podaj.',
  ]),
  r(2, 'Owsianka z bananem', 10, 1, [
    ['płatki owsiane', 60, 'g'], ['mleko', 250, 'ml'], ['banan', 1, 'szt'], ['miód', 10, 'g'],
  ], [
    'Zagotuj mleko z płatkami i gotuj 5 minut, mieszając.',
    'Banana pokrój w plasterki.',
    'Przełóż owsiankę do miski, dodaj banana i polej miodem.',
  ]),
  r(3, 'Makaron z pesto i kurczakiem', 30, 2, [
    ['makaron', 200, 'g'], ['pierś z kurczaka', 250, 'g'], ['pesto', 80, 'g'], ['parmezan', 30, 'g'], ['oliwa z oliwek', 15, 'ml'],
  ], [
    'Ugotuj makaron al dente według instrukcji na opakowaniu.',
    'Kurczaka pokrój w kostkę i usmaż na oliwie do zarumienienia, około 8 minut.',
    'Wymieszaj makaron z kurczakiem i pesto, dodaj odrobinę wody z gotowania.',
    'Podaj posypany startym parmezanem.',
  ]),
  r(4, 'Zupa pomidorowa z ryżem', 40, 4, [
    ['pomidory', 800, 'g'], ['ryż', 100, 'g'], ['marchew', 2, 'szt'], ['cebula', 1, 'szt'], ['bulion', 1000, 'ml'], ['śmietana', 100, 'ml'],
  ], [
    'Podsmaż posiekaną cebulę i pokrojoną marchew w garnku.',
    'Dodaj pomidory i bulion, gotuj 20 minut, następnie zmiksuj.',
    'Wsyp ugotowany osobno ryż, dopraw i zabiel śmietaną.',
  ]),
  r(5, 'Sałatka grecka z fetą', 15, 2, [
    ['pomidory', 300, 'g'], ['ogórek', 1, 'szt'], ['feta', 150, 'g'], ['cebula', 1, 'szt'], ['oliwa z oliwek', 30, 'ml'], ['oregano', 1, 'szt'],
  ], [
    'Pomidory i ogórka pokrój w grubą kostkę, cebulę w cienkie piórka.',
    'Dodaj fetę pokrojoną w kostkę.',
    'Polej oliwą, posyp oregano i delikatnie wymieszaj.',
  ]),
  r(6, 'Placki ziemniaczane', 35, 3, [
    ['ziemniaki', 700, 'g'], ['cebula', 1, 'szt'], ['jajka', 1, 'szt'], ['mąka', 40, 'g'], ['olej', 100, 'ml'],
  ], [
    'Ziemniaki i cebulę zetrzyj na tarce, odciśnij nadmiar soku.',
    'Wymieszaj z jajkiem i mąką, dopraw solą i pieprzem.',
    'Smaż porcje masy na rozgrzanym oleju z obu stron na złoty kolor.',
  ]),
  r(7, 'Curry z ciecierzycą', 35, 3, [
    ['ciecierzyca', 400, 'g'], ['pomidory', 400, 'g'], ['cebula', 1, 'szt'], ['czosnek', 3, 'szt'], ['mleko kokosowe', 200, 'ml'], ['ryż', 150, 'g'],
  ], [
    'Podsmaż cebulę i czosnek, dodaj przyprawy curry.',
    'Wlej pomidory i mleko kokosowe, dodaj ciecierzycę i duś 20 minut.',
    'Podaj z ugotowanym ryżem.',
  ]),
  r(8, 'Tortilla z kurczakiem i warzywami', 20, 2, [
    ['tortille', 2, 'szt'], ['pierś z kurczaka', 250, 'g'], ['papryka', 1, 'szt'], ['sałata', 100, 'g'], ['jogurt', 100, 'g'],
  ], [
    'Kurczaka pokrój w paski i usmaż do zarumienienia.',
    'Paprykę i sałatę pokrój, jogurt dopraw solą i czosnkiem.',
    'Na tortillach ułóż sałatę, kurczaka i paprykę, polej sosem jogurtowym i zwiń.',
  ]),
  r(9, 'Naleśniki z twarogiem', 30, 3, [
    ['mąka', 150, 'g'], ['mleko', 300, 'ml'], ['jajka', 2, 'szt'], ['twaróg', 250, 'g'], ['cukier', 20, 'g'],
  ], [
    'Zmiksuj mąkę, mleko i jajka na gładkie ciasto, odstaw na 10 minut.',
    'Usmaż cienkie naleśniki na suchej patelni.',
    'Twaróg wymieszaj z cukrem, nałóż na naleśniki i zwiń.',
  ]),
  r(10, 'Jogurt z malinami i orzechami', 5, 1, [
    ['jogurt', 200, 'g'], ['maliny', 100, 'g'], ['orzechy', 20, 'g'],
  ], [
    'Jogurt przełóż do miseczki.',
    'Dodaj maliny i posiekane orzechy.',
  ]),
  r(11, 'Spaghetti aglio e olio', 20, 2, [
    ['makaron', 200, 'g'], ['czosnek', 4, 'szt'], ['oliwa z oliwek', 50, 'ml'], ['natka pietruszki', 1, 'szt'], ['papryczka chili', 1, 'szt'],
  ], [
    'Ugotuj makaron w osolonej wodzie, zostaw szklankę wody z gotowania.',
    'Na oliwie podsmaż cienko pokrojony czosnek i chili, nie dopuść do przypalenia.',
    'Dodaj makaron i trochę wody z gotowania, wymieszaj, posyp natką.',
  ]),
  r(12, 'Pieczone ziemniaki z jajkiem sadzonym', 45, 2, [
    ['ziemniaki', 600, 'g'], ['jajka', 2, 'szt'], ['olej', 30, 'ml'], ['czosnek', 2, 'szt'],
  ], [
    'Ziemniaki pokrój w cząstki, wymieszaj z olejem, czosnkiem i solą.',
    'Piecz w 210°C przez 35 minut, przewracając w połowie.',
    'Na patelni usmaż jajka sadzone i podaj z ziemniakami.',
  ]),
];
