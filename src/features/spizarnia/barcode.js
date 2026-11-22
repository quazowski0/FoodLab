/* =========================================================
   Kod kreskowy: odczyt ze zdjęcia (html5-qrcode) i rozbiór opisu opakowania.
   Zapytania do Open Food Facts są w jednym miejscu: features/baza/openFoodFacts.js.
   ========================================================= */

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
