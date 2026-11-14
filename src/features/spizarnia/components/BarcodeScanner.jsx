import { useRef, useState } from 'react';
import { fetchProductByBarcode, isValidBarcode, readBarcodeFromImage } from '../barcode.js';

const READER_ID = 'sp-barcode-reader';

// Dodawanie przez zdjęcie kodu kreskowego. Na telefonie przycisk od razu otwiera aparat,
// na komputerze można wybrać zdjęcie z dysku albo wpisać numer spod kodu.
// onFound(produkt) dostaje dane gotowe do wstawienia w formularz.
export default function BarcodeScanner({ onFound }) {
  const fileRef = useRef(null);
  const [manual, setManual] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });
  const busy = state.status === 'busy';

  const lookup = async (code) => {
    setState({ status: 'busy', message: `Szukam produktu ${code}...` });
    try {
      const product = await fetchProductByBarcode(code);
      if (product?.name) {
        onFound(product);
        setState({ status: 'ok', message: `Znaleziono: ${product.name}. Sprawdź ilość, ustaw datę i dodaj.` });
      } else {
        onFound({ barcode: code });
        setState({ status: 'warn', message: `Kodu ${code} nie ma w Open Food Facts. Wpisz nazwę ręcznie.` });
      }
    } catch {
      onFound({ barcode: code });
      setState({ status: 'error', message: 'Nie udało się połączyć z Open Food Facts. Sprawdź internet albo wpisz nazwę ręcznie.' });
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // żeby to samo zdjęcie dało się wybrać jeszcze raz
    if (!file) return;
    setState({ status: 'busy', message: 'Odczytuję kod ze zdjęcia...' });
    let code;
    try {
      code = await readBarcodeFromImage(file, READER_ID);
    } catch {
      setState({ status: 'error', message: 'Nie widać kodu na zdjęciu. Zrób ostrzejsze zdjęcie z bliska albo wpisz numer.' });
      return;
    }
    await lookup(code);
  };

  const onManual = (e) => {
    e.preventDefault();
    const code = manual.trim();
    if (!isValidBarcode(code)) {
      setState({ status: 'error', message: 'Numer kodu to 8 do 14 cyfr spod kresek.' });
      return;
    }
    setManual('');
    lookup(code);
  };

  return (
    <div className="sp-scan">
      <div className="sp-scan__row">
        <button type="button" className="sp-btn sp-btn--ghost sp-scan__photo" onClick={() => fileRef.current?.click()} disabled={busy}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5v10M5.5 5v10M8 5v10M11 5v10M13 5v10M15.5 5v10M17 5v10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Zdjęcie kodu kreskowego
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />

        <form className="sp-scan__manual" onSubmit={onManual}>
          <input
            className="sp-input"
            inputMode="numeric"
            value={manual}
            onChange={(e) => setManual(e.target.value.replace(/\D/g, ''))}
            placeholder="albo wpisz numer kodu"
            aria-label="Numer kodu kreskowego"
            maxLength={14}
          />
          <button type="submit" className="sp-btn sp-btn--ghost" disabled={busy}>Szukaj</button>
        </form>
      </div>

      {state.message && (
        <p className={`sp-scan__msg sp-scan__msg--${state.status}`} role="status">{state.message}</p>
      )}
      {/* html5-qrcode potrzebuje elementu w DOM, nawet przy skanowaniu pliku */}
      <div id={READER_ID} hidden />
    </div>
  );
}
