// Przykładowe przepisy w kształcie, który ma zwracać normalizeRecipe z modułu przepisów (Krzysiek).
// Wartości odżywcze na 1 porcję. Do podmiany na dane ze Spoonacular
// (informationBulk z includeNutrition=true). Kategorie z pola dishTypes, patrz categories.js.
export const SAMPLE_RECIPES = [
  { id: 1, categories: ['sniadanie'], title: 'Owsianka z bananem i masłem orzechowym', readyInMinutes: 10, servings: 1, ingredientsCount: 6, stepsCount: 4, nutrition: { kcal: 380, protein: 12, fat: 9, carbs: 62 } },
  { id: 2, categories: ['sniadanie', 'kolacja'], title: 'Jajecznica ze szczypiorkiem', readyInMinutes: 10, servings: 1, ingredientsCount: 4, stepsCount: 3, nutrition: { kcal: 310, protein: 20, fat: 23, carbs: 3 } },
  { id: 3, categories: ['kolacja'], title: 'Sałatka grecka z fetą', readyInMinutes: 15, servings: 2, ingredientsCount: 8, stepsCount: 4, nutrition: { kcal: 340, protein: 9, fat: 27, carbs: 14 } },
  { id: 4, categories: ['obiad'], title: 'Makaron z pesto i kurczakiem', readyInMinutes: 30, servings: 2, ingredientsCount: 9, stepsCount: 7, nutrition: { kcal: 640, protein: 41, fat: 24, carbs: 62 } },
  { id: 5, categories: ['obiad'], title: 'Zupa pomidorowa z ryżem', readyInMinutes: 40, servings: 4, ingredientsCount: 10, stepsCount: 8, nutrition: { kcal: 260, protein: 8, fat: 9, carbs: 35 } },
  { id: 6, categories: ['obiad'], title: 'Curry z ciecierzycą', readyInMinutes: 35, servings: 3, ingredientsCount: 10, stepsCount: 9, nutrition: { kcal: 520, protein: 18, fat: 17, carbs: 70 } },
  { id: 7, categories: ['obiad', 'kolacja'], title: 'Placki ziemniaczane', readyInMinutes: 35, servings: 3, ingredientsCount: 6, stepsCount: 6, nutrition: { kcal: 450, protein: 9, fat: 22, carbs: 54 } },
  { id: 8, categories: ['obiad'], title: 'Pierogi ruskie', readyInMinutes: 75, servings: 4, ingredientsCount: 9, stepsCount: 12, nutrition: { kcal: 610, protein: 19, fat: 21, carbs: 86 } },
  { id: 9, categories: ['obiad'], title: 'Lasagne bolognese', readyInMinutes: 90, servings: 6, ingredientsCount: 14, stepsCount: 14, nutrition: { kcal: 780, protein: 42, fat: 38, carbs: 64 } },
  { id: 10, categories: ['sniadanie', 'przekaski'], title: 'Jogurt grecki z malinami i orzechami', readyInMinutes: 5, servings: 1, ingredientsCount: 3, stepsCount: 2, nutrition: { kcal: 210, protein: 15, fat: 8, carbs: 18 } },
  { id: 11, categories: ['przekaski', 'sniadanie'], title: 'Koktajl bananowo-szpinakowy', readyInMinutes: 5, servings: 1, ingredientsCount: 4, stepsCount: 2, nutrition: { kcal: 180, protein: 7, fat: 3, carbs: 32 } },
  { id: 12, categories: ['desery'], title: 'Panna cotta z malinami', readyInMinutes: 20, servings: 4, ingredientsCount: 5, stepsCount: 5, nutrition: { kcal: 320, protein: 5, fat: 22, carbs: 26 } },
  { id: 13, categories: ['desery'], title: 'Brownie z czarnej fasoli', readyInMinutes: 40, servings: 8, ingredientsCount: 9, stepsCount: 7, nutrition: { kcal: 260, protein: 6, fat: 12, carbs: 34 } },
  { id: 14, categories: ['kolacja'], title: 'Tortilla z kurczakiem i warzywami', readyInMinutes: 20, servings: 2, ingredientsCount: 8, stepsCount: 5, nutrition: { kcal: 520, protein: 34, fat: 18, carbs: 54 } },
  { id: 15, categories: ['sniadanie', 'kolacja'], title: 'Kanapki z twarożkiem i rzodkiewką', readyInMinutes: 10, servings: 1, ingredientsCount: 5, stepsCount: 3, nutrition: { kcal: 330, protein: 18, fat: 12, carbs: 36 } },
  { id: 16, categories: ['przekaski'], title: 'Hummus z marchewką', readyInMinutes: 10, servings: 2, ingredientsCount: 5, stepsCount: 3, nutrition: { kcal: 220, protein: 8, fat: 12, carbs: 20 } },
];
