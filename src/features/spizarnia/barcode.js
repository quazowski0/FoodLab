/* =========================================================
   Kod kreskowy: odczyt ze zdjęcia (html5-qrcode) i pobranie
   produktu z Open Food Facts (bez klucza API).
   ========================================================= */

const OFF_URL = 'https://world.openfoodfacts.org/api/v2/product/';
const OFF_FIELDS = 'product_name,product_name_pl,product_name_en,generic_name_pl,brands,quantity,nutriments';

// Odczytuje kod (EAN-13, EAN-8, UPC, Code 128) ze zdjęcia. elementId = pusty, ukryty <div> na stronie.
// Biblioteka ładuje się dopiero przy pierwszym skanie, więc nie spowalnia startu aplikacji.
export async function readBarcodeFromImage(file, elementId) {
  const { Html5Qrcode, Html5QrcodeSupportedFormats: F } = await import('html5-qrcode');
  const reader = new Html5Qrcode(elementId, {
    verbose: false,
    formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128],
    useBarCodeDetectorIfSupported: true,
  });
  try {
    return await reader.scanFile(file, false);
  } finally {
    reader.clear();
  }
}

export function isValidBarcode(code) {
  return /^\d{8,14}$/.test(String(code).trim());
}

// "500 g" -> { quantity: 500, unit: 'g' }, "1,5 l" -> { quantity: 1.5, unit: 'l' }
export function parsePackage(text) {
  const m = String(text ?? '').toLowerCase().replace(',', '.').match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|cl|l)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  if (m[2] === 'cl') return { quantity: n * 10, unit: 'ml' };
  return { quantity: n, unit: m[2] };
}

function round(n) {
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : undefined;
}

// Zwraca produkt w formacie spiżarni albo null, gdy kodu nie ma w bazie.
// Rzuca błąd, gdy nie ma internetu albo API nie odpowiada.
export async function fetchProductByBarcode(code, { signal } = {}) {
  const res = await fetch(`${OFF_URL}${encodeURIComponent(code)}.json?fields=${OFF_FIELDS}`, { signal });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Food Facts: HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const name = p.product_name_pl || p.product_name || p.generic_name_pl || p.product_name_en || '';
  const brand = String(p.brands ?? '').split(',')[0].trim();
  const n = p.nutriments ?? {};
  const kcal = round(n['energy-kcal_100g']);
  const pack = parsePackage(p.quantity);

  return {
    name: brand && name && !name.toLowerCase().includes(brand.toLowerCase()) ? `${name} ${brand}` : name || brand,
    nameEn: p.product_name_en || undefined,
    barcode: String(code),
    source: 'openfoodfacts',
    ...(pack ?? {}),
    nutrition:
      kcal === undefined
        ? undefined
        : {
            kcal,
            protein: round(n.proteins_100g) ?? 0,
            fat: round(n.fat_100g) ?? 0,
            carbs: round(n.carbohydrates_100g) ?? 0,
          },
  };
}
