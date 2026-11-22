/* =========================================================
   Produkty podstawowe: owoce, warzywa, jajka, mięso, kasze itp.
   Open Food Facts zbiera głównie produkty paczkowane z kodem kreskowym,
   więc "zwykłej pomarańczy" czy ziemniaków tam praktycznie nie ma.
   Wartości to typowe średnie na 100 g produktu surowego (tabele USDA / IŻŻ, zaokrąglone).
   ========================================================= */

// [nazwa, angielska nazwa, kcal, białko, tłuszcz, węglowodany, typowe opakowanie]
const RAW = [
  // owoce
  ['Pomarańcza', 'orange', 47, 0.9, 0.1, 11.8, [1, 'szt']],
  ['Mandarynka', 'mandarin', 53, 0.8, 0.3, 13.3, [1, 'szt']],
  ['Cytryna', 'lemon', 29, 1.1, 0.3, 9.3, [1, 'szt']],
  ['Limonka', 'lime', 30, 0.7, 0.2, 10.5, [1, 'szt']],
  ['Grejpfrut', 'grapefruit', 42, 0.8, 0.1, 10.7, [1, 'szt']],
  ['Jabłko', 'apple', 52, 0.3, 0.2, 13.8, [1, 'szt']],
  ['Gruszka', 'pear', 57, 0.4, 0.1, 15.2, [1, 'szt']],
  ['Banan', 'banana', 89, 1.1, 0.3, 22.8, [1, 'szt']],
  ['Kiwi', 'kiwi', 61, 1.1, 0.5, 14.7, [1, 'szt']],
  ['Winogrona', 'grapes', 69, 0.7, 0.2, 18.1, [500, 'g']],
  ['Truskawki', 'strawberries', 32, 0.7, 0.3, 7.7, [250, 'g']],
  ['Maliny', 'raspberries', 52, 1.2, 0.7, 11.9, [125, 'g']],
  ['Borówki', 'blueberries', 57, 0.7, 0.3, 14.5, [125, 'g']],
  ['Śliwki', 'plums', 46, 0.7, 0.3, 11.4, [500, 'g']],
  ['Brzoskwinia', 'peach', 39, 0.9, 0.3, 9.5, [1, 'szt']],
  ['Ananas', 'pineapple', 50, 0.5, 0.1, 13.1, [1, 'szt']],
  ['Mango', 'mango', 60, 0.8, 0.4, 15, [1, 'szt']],
  ['Arbuz', 'watermelon', 30, 0.6, 0.2, 7.6, [1, 'kg']],
  ['Awokado', 'avocado', 160, 2, 14.7, 8.5, [1, 'szt']],
  // warzywa
  ['Ziemniaki', 'potatoes', 77, 2, 0.1, 17.5, [1, 'kg']],
  ['Bataty', 'sweet potato', 86, 1.6, 0.1, 20.1, [1, 'kg']],
  ['Marchew', 'carrot', 41, 0.9, 0.2, 9.6, [1, 'kg']],
  ['Cebula', 'onion', 40, 1.1, 0.1, 9.3, [1, 'kg']],
  ['Czosnek', 'garlic', 149, 6.4, 0.5, 33.1, [1, 'szt']],
  ['Pomidor', 'tomato', 18, 0.9, 0.2, 3.9, [500, 'g']],
  ['Ogórek', 'cucumber', 15, 0.7, 0.1, 3.6, [1, 'szt']],
  ['Papryka czerwona', 'red bell pepper', 31, 1, 0.3, 6, [1, 'szt']],
  ['Sałata', 'lettuce', 15, 1.4, 0.2, 2.9, [1, 'szt']],
  ['Szpinak', 'spinach', 23, 2.9, 0.4, 3.6, [250, 'g']],
  ['Brokuł', 'broccoli', 34, 2.8, 0.4, 6.6, [1, 'szt']],
  ['Kalafior', 'cauliflower', 25, 1.9, 0.3, 5, [1, 'szt']],
  ['Kapusta biała', 'cabbage', 25, 1.3, 0.1, 5.8, [1, 'szt']],
  ['Cukinia', 'zucchini', 17, 1.2, 0.3, 3.1, [1, 'szt']],
  ['Bakłażan', 'eggplant', 25, 1, 0.2, 5.9, [1, 'szt']],
  ['Pieczarki', 'mushrooms', 22, 3.1, 0.3, 3.3, [500, 'g']],
  ['Seler', 'celery', 16, 0.7, 0.2, 3, [1, 'szt']],
  ['Por', 'leek', 61, 1.5, 0.3, 14.2, [1, 'szt']],
  ['Burak', 'beetroot', 43, 1.6, 0.2, 9.6, [1, 'kg']],
  ['Kukurydza', 'corn', 86, 3.3, 1.4, 19, [1, 'szt']],
  ['Groszek zielony', 'green peas', 81, 5.4, 0.4, 14.5, [400, 'g']],
  ['Rzodkiewka', 'radish', 16, 0.7, 0.1, 3.4, [1, 'szt']],
  ['Natka pietruszki', 'parsley', 36, 3, 0.8, 6.3, [1, 'szt']],
  ['Koperek', 'dill', 43, 3.5, 1.1, 7, [1, 'szt']],
  ['Szczypiorek', 'chives', 30, 3.3, 0.7, 4.4, [1, 'szt']],
  // nabiał i jajka
  ['Jajka', 'eggs', 143, 12.6, 9.5, 0.7, [10, 'szt']],
  ['Mleko 2%', 'milk', 50, 3.3, 2, 4.8, [1, 'l']],
  ['Masło', 'butter', 717, 0.9, 81, 0.1, [200, 'g']],
  ['Twaróg półtłusty', 'cottage cheese', 133, 18.7, 4.7, 3.7, [250, 'g']],
  ['Jogurt naturalny', 'plain yogurt', 61, 3.5, 3.3, 4.7, [400, 'g']],
  ['Śmietana 18%', 'sour cream', 184, 2.5, 18, 3.6, [200, 'g']],
  // mięso i ryby
  ['Pierś z kurczaka', 'chicken breast', 120, 22.5, 2.6, 0, [500, 'g']],
  ['Udka z kurczaka', 'chicken thighs', 177, 17.3, 11.8, 0, [1, 'kg']],
  ['Mięso mielone wieprzowe', 'ground pork', 263, 16.9, 21.2, 0, [500, 'g']],
  ['Wołowina', 'beef', 187, 20, 12, 0, [500, 'g']],
  ['Łosoś', 'salmon', 208, 20.4, 13.4, 0, [300, 'g']],
  ['Dorsz', 'cod', 82, 17.8, 0.7, 0, [300, 'g']],
  // zbożowe, strączki
  ['Ryż biały', 'white rice', 360, 6.6, 0.6, 79, [1, 'kg']],
  ['Makaron', 'pasta', 371, 13, 1.5, 75, [500, 'g']],
  ['Płatki owsiane', 'oats', 379, 13.2, 6.5, 67.7, [500, 'g']],
  ['Kasza gryczana', 'buckwheat', 343, 13.3, 3.4, 71.5, [500, 'g']],
  ['Kasza jaglana', 'millet', 378, 11, 4.2, 72.8, [500, 'g']],
  ['Mąka pszenna', 'flour', 364, 10.3, 1, 76.3, [1, 'kg']],
  ['Chleb pszenny', 'bread', 265, 9, 3.2, 49, [1, 'szt']],
  ['Ciecierzyca sucha', 'chickpeas', 364, 19.3, 6, 60.7, [500, 'g']],
  ['Soczewica czerwona', 'red lentils', 358, 24, 2.2, 63, [500, 'g']],
  ['Fasola biała sucha', 'white beans', 333, 23.4, 0.9, 60.3, [500, 'g']],
  // inne
  ['Oliwa z oliwek', 'olive oil', 884, 0, 100, 0, [500, 'ml']],
  ['Olej rzepakowy', 'canola oil', 884, 0, 100, 0, [1, 'l']],
  ['Cukier', 'sugar', 387, 0, 0, 100, [1, 'kg']],
  ['Miód', 'honey', 304, 0.3, 0, 82.4, [400, 'g']],
  ['Orzechy włoskie', 'walnuts', 654, 15.2, 65.2, 13.7, [200, 'g']],
  ['Migdały', 'almonds', 579, 21.2, 49.9, 21.6, [200, 'g']],
];

// Zdjęcia składników z darmowego CDN Spoonacular (bez klucza). Brakujące (np. mandarynka, kasza gryczana)
// zastępuje kafelek z pierwszą literą nazwy, patrz ProductRow.
const IMG = 'https://img.spoonacular.com/ingredients_100x100/';
const IMAGES = {
  'orange': 'orange.jpg',
  'lemon': 'lemon.jpg',
  'lime': 'lime.jpg',
  'grapefruit': 'grapefruit.jpg',
  'apple': 'apple.jpg',
  'pear': 'pear.jpg',
  'banana': 'bananas.jpg',
  'kiwi': 'kiwi.png',
  'grapes': 'red-grapes.jpg',
  'strawberries': 'strawberries.jpg',
  'raspberries': 'raspberries.jpg',
  'blueberries': 'blueberries.jpg',
  'plums': 'plum.jpg',
  'peach': 'peach.png',
  'pineapple': 'pineapple.jpg',
  'mango': 'mango.jpg',
  'watermelon': 'watermelon.jpg',
  'avocado': 'avocado.jpg',
  'potatoes': 'red-potatoes.jpg',
  'sweet potato': 'sweet-potato.jpg',
  'carrot': 'carrots.jpg',
  'onion': 'brown-onion.jpg',
  'garlic': 'garlic.jpg',
  'tomato': 'tomato.jpg',
  'cucumber': 'cucumber.jpg',
  'red bell pepper': 'red-pepper.jpg',
  'lettuce': 'iceberg-lettuce.jpg',
  'spinach': 'spinach.jpg',
  'broccoli': 'broccoli.jpg',
  'cauliflower': 'cauliflower.jpg',
  'cabbage': 'cabbage.jpg',
  'zucchini': 'zucchini.jpg',
  'eggplant': 'eggplant.jpg',
  'mushrooms': 'mushrooms.jpg',
  'celery': 'celery.jpg',
  'leek': 'leeks.jpg',
  'beetroot': 'beets.jpg',
  'corn': 'corn.jpg',
  'green peas': 'peas.jpg',
  'radish': 'radishes.jpg',
  'parsley': 'parsley.jpg',
  'dill': 'dill.jpg',
  'chives': 'fresh-chives.jpg',
  'eggs': 'egg.jpg',
  'milk': 'milk.jpg',
  'butter': 'butter.jpg',
  'cottage cheese': 'cottage-cheese.jpg',
  'plain yogurt': 'plain-yogurt.jpg',
  'sour cream': 'sour-cream.jpg',
  'chicken breast': 'chicken-breasts.jpg',
  'chicken thighs': 'chicken-thighs.jpg',
  'ground pork': 'meat-ground.jpg',
  'beef': 'beef-cubes-raw.jpg',
  'salmon': 'salmon.jpg',
  'cod': 'fish-fillet.jpg',
  'white rice': 'uncooked-white-rice.png',
  'pasta': 'fusilli.jpg',
  'oats': 'rolled-oats.jpg',
  'millet': 'millet.jpg',
  'flour': 'flour.jpg',
  'bread': 'white-bread.jpg',
  'chickpeas': 'chickpeas.jpg',
  'red lentils': 'red-lentils.png',
  'white beans': 'white-beans.jpg',
  'olive oil': 'olive-oil.jpg',
  'canola oil': 'rapeseed-oil.jpg',
  'sugar': 'white-sugar.jpg',
  'honey': 'honey.jpg',
  'walnuts': 'walnuts.jpg',
  'almonds': 'almonds.jpg',
};

export const BASIC_PRODUCTS = RAW.map(([name, nameEn, kcal, protein, fat, carbs, [quantity, unit]], i) => ({
  id: `basic-${i + 1}`,
  name,
  brand: '',
  nameEn,
  barcode: '',
  image: IMAGES[nameEn] ? IMG + IMAGES[nameEn] : '',
  pack: { quantity, unit },
  nutrition: { kcal, protein, fat, carbs },
  source: 'podstawowe',
}));

const norm = (s) => String(s ?? '').toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

// Dopasowanie odporne na odmianę: "pomarancze" znajdzie "Pomarańcza", "jajko" znajdzie "Jajka".
// Bierzemy początek każdego wpisanego słowa (bez 2 ostatnich liter, min. 3) i szukamy go na początku słów nazwy.
export function searchBasic(query, limit = 6) {
  const words = norm(query).split(/\s+/).filter((w) => w.length >= 2);
  if (!words.length) return [];
  const stems = words.map((w) => (w.length > 4 ? w.slice(0, Math.max(3, w.length - 2)) : w));
  return BASIC_PRODUCTS.filter((p) => {
    const nameWords = `${norm(p.name)} ${norm(p.nameEn)}`.split(/\s+/);
    return stems.every((s) => nameWords.some((w) => w.startsWith(s)));
  }).slice(0, limit);
}
