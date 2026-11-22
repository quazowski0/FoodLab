/* =========================================================
   Miniatura dla produktu w spiżarni.
   Kolejność: zdjęcie zapisane przy produkcie (np. z Open Food Facts),
   produkt podstawowy o tej samej nazwie, potem słowa kluczowe (PL i EN).
   Wszystkie pliki poniżej sprawdzone na img.spoonacular.com (istnieją).
   ========================================================= */
import { BASIC_PRODUCTS, searchBasic } from './basicProducts.js';

const IMG = 'https://img.spoonacular.com/ingredients_100x100/';

// [wzorzec na nazwie (PL lub EN), plik]
const KEYWORDS = [
  [/\b(ser żółty|gouda|cheddar|cheese)\b/i, 'cheddar-cheese.png'],
  [/\bmozzarell/i, 'mozzarella.png'],
  [/\bfeta\b/i, 'feta.png'],
  [/\b(parmezan|parmesan)/i, 'parmesan.jpg'],
  [/\b(serek|cream cheese)/i, 'cream-cheese.jpg'],
  [/\b(twaróg|twarog|cottage)/i, 'cottage-cheese.jpg'],
  [/\b(szynk|ham)/i, 'ham.jpg'],
  [/\b(boczek|bacon)/i, 'bacon.jpg'],
  [/\b(indyk|turkey)/i, 'turkey-raw-whole.jpg'],
  [/\b(jaj|egg)/i, 'egg.png'],
  [/\b(mleko|milk)\b/i, 'milk.png'],
  [/\b(jogurt|yogurt)/i, 'plain-yogurt.jpg'],
  [/(śmietan|sour cream)/i, 'sour-cream.jpg'],
  [/\b(masło orzechowe|peanut butter)/i, 'peanut-butter.png'],
  [/\b(masło|butter)\b/i, 'butter.jpg'],
  [/\b(ogórki kiszone|ogórek kiszony|pickle)/i, 'dill-pickles.jpg'],
  [/\b(kapusta kiszona|sauerkraut)/i, 'sauerkraut.jpg'],
  [/\b(papryk|bell pepper)/i, 'red-pepper.jpg'],
  [/\b(ziemniak|potato)/i, 'red-potatoes.jpg'],
  [/\b(makaron|pasta|spaghetti)/i, 'fusilli.jpg'],
  [/\b(ryż|ryz|rice)(?![a-z])/i, 'uncooked-white-rice.png'],
  [/\b(chleb|bułk|bread)/i, 'white-bread.jpg'],
  [/\b(pieczark|grzyb|mushroom)/i, 'mushrooms.jpg'],
  [/\b(kurczak|chicken)/i, 'chicken-breasts.jpg'],
  [/\b(tofu)\b/i, 'tofu.png'],
  [/\b(ketchup)/i, 'ketchup.png'],
  [/\b(majonez|mayonnaise)/i, 'mayonnaise.png'],
  [/\b(musztard|mustard)/i, 'mustard.jpg'],
  [/\b(sok pomarańcz|orange juice)/i, 'orange-juice.jpg'],
  [/\b(sok jabłk|apple juice)/i, 'apple-juice.jpg'],
  [/\b(kawa|coffee)/i, 'coffee-beans.jpg'],
  [/\b(herbat|tea)\b/i, 'tea-bags.jpg'],
  [/\b(sól|salt)\b/i, 'salt.jpg'],
  [/\b(pieprz)\b/i, 'pepper.jpg'],
  [/\b(mrożonk|mieszanka warzyw|mixed vegetables)/i, 'mixed-vegetables.png'],
];

const byEn = new Map(BASIC_PRODUCTS.filter((p) => p.image).map((p) => [p.nameEn, p.image]));

export function productImage(item) {
  if (item.image) return item.image;
  if (item.nameEn && byEn.has(item.nameEn.toLowerCase())) return byEn.get(item.nameEn.toLowerCase());
  const text = `${item.name ?? ''} ${item.nameEn ?? ''}`;
  const hit = KEYWORDS.find(([re]) => re.test(text));
  if (hit) return IMG + hit[1];
  return searchBasic(item.name ?? '', 1)[0]?.image || (item.nameEn ? searchBasic(item.nameEn, 1)[0]?.image : '') || '';
}
