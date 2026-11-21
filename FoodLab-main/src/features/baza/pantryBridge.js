// Zamiana produktu z bazy na produkt spiżarni (format z features/spizarnia/pantryStore.js)
export function toPantryItem(product) {
  const name = product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase())
    ? `${product.name} ${product.brand}`
    : product.name;
  return {
    name,
    nameEn: product.nameEn,
    barcode: product.barcode || undefined,
    source: product.source,
    quantity: product.pack?.quantity ?? 1,
    unit: product.pack?.unit ?? 'szt',
    nutrition: product.nutrition ?? undefined,
  };
}
