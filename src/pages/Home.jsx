import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReceiptPreview, { PantryPick } from '../components/ReceiptPreview.jsx';
import { usePantry, expiryStatus, expiryLabel } from '../features/spizarnia';

// Strona startowa w stylu paragonu (koncepcja 13)

const modules = [
  { to: '/spizarnia', title: 'Spiżarnia', text: 'Produkty z ilością i datą ważności.', owner: 'Olek' },
  { to: '/spizarnia?zakladka=baza', title: 'Baza produktów', text: 'Open Food Facts i wartości odżywcze.', owner: 'Michał' },
  { to: '/przepisy', title: 'Przepisy i zakupy', text: 'Dania z tego, co masz, i lista zakupów.', owner: 'Krzysiek' },
  { to: '/podsumowanie', title: 'Filtry i makro', text: 'Trudność, kalorie i makroskładniki.', owner: 'Maks' },
];

const steps = [
  { title: 'Uzupełnij spiżarnię', text: 'Wpisz produkty ręcznie albo znajdź je w bazie.' },
  { title: 'Znajdź przepis', text: 'FoodLab dopasuje dania do tego, co masz.' },
  { title: 'Gotuj', text: 'Ustaw trudność i kalorie, a braki trafią na listę zakupów.' },
];

const stats = [
  { value: '4', label: 'moduły w jednej aplikacji' },
  { value: '2', label: 'darmowe bazy jedzenia' },
  { value: '100%', label: 'danych zostaje u Ciebie' },
  { value: '0 zł', label: 'za korzystanie' },
];

const tape = ['4 moduły', '0 zł', 'bez logowania', 'dane zostają w przeglądarce', 'Open Food Facts', 'Spoonacular'];

const STATUS = {
  expired: { cls: 'is-bad', text: 'Po terminie' },
  soon: { cls: 'is-mid', text: 'Zjedz szybko' },
  ok: { cls: 'is-ok', text: 'OK' },
  none: { cls: '', text: 'Bez daty' },
};

const fmtDate = (iso) => (iso ? iso.split('-').reverse().join('.') : '-');
const fmtQty = (p) => `${String(p.quantity).replace('.', ',')} ${p.unit}`;

// Prawdziwa spiżarnia (tylko odczyt): 5 produktów z najbliższą datą ważności
function Stock() {
  const { items } = usePantry();
  const list = [...items]
    .filter((p) => p.quantity > 0)
    .sort((a, b) => (a.expiry || '9999').localeCompare(b.expiry || '9999'))
    .slice(0, 5);

  if (!list.length) {
    return (
      <div className="ticket stock stock--empty">
        <p>Magazyn pusty. Dodaj pierwsze produkty, a tutaj zobaczysz, co trzeba zjeść najpierw.</p>
        <Link to="/spizarnia" className="btn btn--primary">Otwórz spiżarnię</Link>
      </div>
    );
  }

  return (
    <div className="ticket stock">
      <div className="stock__row stock__row--head">
        <span>Produkt</span><span>Ilość</span><span>Ważne do</span><span>Status</span>
      </div>
      {list.map((p) => {
        const st = STATUS[expiryStatus(p.expiry)] ?? STATUS.none;
        return (
          <div key={p.id} className="stock__row">
            <span className="stock__name">{p.name}</span>
            <span>{fmtQty(p)}</span>
            <span>{fmtDate(p.expiry)}</span>
            <span className={`stock__st ${st.cls}`} title={expiryLabel(p.expiry)}>{st.text}</span>
          </div>
        );
      })}
      <Link to="/spizarnia" className="stock__more">Cała spiżarnia ({items.length} poz.) &rarr;</Link>
    </div>
  );
}

export default function Home() {
  // pokazowa spiżarnia w hero (startowo wszystko jest w domu oprócz sosu sojowego)
  const [have, setHave] = useState(
    () => new Set(['kurczak', 'ryż', 'papryka', 'brokuł', 'cebula', 'czosnek', 'jajka', 'szpinak']),
  );
  const toggle = (item) =>
    setHave((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__text">
          <p className="kicker">Nr 0001 · wirtualna spiżarnia · bez logowania</p>
          <h1>Rachunek za obiad: <span className="accent">0&nbsp;zł</span>.</h1>
          <p className="lead">
            Wpisz, co masz w szafkach. FoodLab dobierze przepis, policzy makro
            i wydrukuje listę tego, czego brakuje.
          </p>
          <div className="hero__actions">
            <Link to="/spizarnia" className="btn btn--primary">Otwórz spiżarnię</Link>
            <Link to="/przepisy" className="btn btn--ghost">Szukaj przepisów</Link>
          </div>
          <PantryPick have={have} onToggle={toggle} />
        </div>
        <div className="hero__art">
          <ReceiptPreview have={have} />
        </div>
      </section>

      <div className="tape" aria-hidden="true">
        <div className="tape__track">
          {[...tape, ...tape].map((t, i) => (
            <span key={i}>*** {t}</span>
          ))}
        </div>
      </div>

      <section className="section">
        <h2>Podsumowanie</h2>
        <p className="section__sub">Krótko, jak na paragonie.</p>
        <div className="stats">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Pozycje na rachunku</h2>
        <p className="section__sub">Cztery moduły, każdy robi ktoś z zespołu.</p>
        <div className="ticket">
          {modules.map((m, i) => (
            <Link key={m.to} to={m.to} className="pos">
              <span className="pos__n">0{i + 1}</span>
              <span className="pos__body">
                <span className="pos__title">{m.title}</span>
                <span className="pos__text">{m.text}</span>
              </span>
              <span className="pos__who">{m.owner}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Stan magazynu</h2>
        <p className="section__sub">Twoja spiżarnia: co masz i co trzeba zjeść najpierw.</p>
        <Stock />
      </section>

      <section className="section">
        <h2>Jak to działa</h2>
        <p className="section__sub">Trzy kroki do obiadu.</p>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.title} className="step">
              <small>Krok {i + 1}/3</small>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta">
        <h2>Zajrzyj do lodówki<br />i wydrukuj obiad.</h2>
        <Link to="/spizarnia" className="btn btn--light">Dodaj pierwsze produkty</Link>
      </section>
    </div>
  );
}
