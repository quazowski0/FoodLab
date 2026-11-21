import { useRef, useState } from 'react';
import { isValidBarcode, readBarcodeFromImage } from '../../spizarnia/barcode.js';
import { fetchByBarcode } from '../openFoodFacts.js';

const READER_ID = 'pd-barcode-reader';

// Skaner kodu kreskowego: zdjęcie (html5-qrcode) albo wpisany numer.
// Czytanie kodu ze zdjęcia robi ta sama funkcja co w spiżarni, żeby nie duplikować biblioteki.
// onResult(produkt) po znalezieniu; onMissing(kod) gdy kodu nie ma w bazie.
export default function BarcodeLookup({ onResult, onMissing }) {
  const fileRef = useRef(null);
  const [manual, setManual] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });
  const busy = state.status === 'busy';

  const lookup = async (code) => {
    setState({ status: 'busy', message: `Szukam produktu o kodzie ${code}...` });
    try {
      const product = await fetchByBarcode(code);
      if (product) {
        onResult(product);
        setState({ status: 'ok', message: `Znaleziono: ${product.name}.` });
      } else {
        onMissing(code);
        setState({ status: 'warn', message: `Kodu ${code} nie ma w Open Food Facts. Możesz dodać produkt ręcznie.` });
      }
    } catch (err) {
      setState({
        status: 'error',
        message:
          err.kind === 'timeout'
            ? 'Open Food Facts nie odpowiada. Spróbuj za chwilę.'
            : 'Nie udało się połączyć z Open Food Facts. Sprawdź internet i spróbuj jeszcze raz.',
      });
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
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
    if (!isValidBarcode(code)) return setState({ status: 'error', message: 'Numer kodu to 8 do 14 cyfr spod kresek.' });
    setManual('');
    lookup(code);
  };

  return (
    <div className="pd-scan">
      <div className="pd-scan__row">
        <button type="button" className="pd-btn pd-btn--ghost pd-scan__photo" onClick={() => fileRef.current?.click()} disabled={busy}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5v10M5.5 5v10M8 5v10M11 5v10M13 5v10M15.5 5v10M17 5v10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Skanuj kod kreskowy
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
        <form className="pd-scan__manual" onSubmit={onManual}>
          <input
            className="pd-input"
            inputMode="numeric"
            value={manual}
            onChange={(e) => setManual(e.target.value.replace(/\D/g, ''))}
            placeholder="albo wpisz numer kodu"
            aria-label="Numer kodu kreskowego"
            maxLength={14}
          />
          <button type="submit" className="pd-btn pd-btn--ghost" disabled={busy}>Szukaj kodu</button>
        </form>
      </div>
      {state.message && <p className={`pd-msg pd-msg--${state.status}`} role="status">{state.message}</p>}
      <div id={READER_ID} hidden />
    </div>
  );
}
