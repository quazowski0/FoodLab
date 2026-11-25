import { useState } from 'react';

/*
  Prawa strona hero: przepis wydrukowany jak paragon.
  Po lewej (w Home) jest lista "co masz w domu" - klikanie zmienia,
  które linie na paragonie mają JEST, a które KUP, i procent składników w domu.
  To pokaz na stronie startowej, nie dotyka prawdziwej spiżarni.
*/

const PANTRY = ['kurczak', 'ryż', 'papryka', 'brokuł', 'cebula', 'czosnek', 'jajka', 'szpinak'];

// waga składnika w przepisie (suma 100), żeby procent "w domu" miał sens
const RECIPE = {
  title: 'Miska z kurczakiem teriyaki',
  time: '25 min',
  needs: [
    { name: 'kurczak', weight: 30 },
    { name: 'ryż', weight: 26 },
    { name: 'papryka', weight: 12 },
    { name: 'brokuł', weight: 12 },
    { name: 'cebula', weight: 8 },
    { name: 'czosnek', weight: 4 },
    { name: 'sos sojowy', weight: 8 },
  ],
  protein: 42,
  carbs: 58,
  fat: 14,
  kcal: 520,
};

const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Lista "co masz w domu" w stylu [x] / [ ]
export function PantryPick({ have, onToggle }) {
  return (
    <div className="pick">
      <h2 className="pick__title">Co masz w domu? (kliknij)</h2>
      <ul className="pick__list">
        {PANTRY.map((item) => (
          <li key={item}>
            <button
              type="button"
              className="pick__btn"
              aria-pressed={have.has(item)}
              onClick={() => onToggle(item)}
            >
              <span className="pick__box" aria-hidden="true">{have.has(item) ? '[x]' : '[ ]'}</span>
              <span>{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReceiptPreview({ have }) {
  const [printed] = useState(today);
  const percent = RECIPE.needs.reduce((sum, n) => sum + (have.has(n.name) ? n.weight : 0), 0);
  const missing = RECIPE.needs.filter((n) => !have.has(n.name)).map((n) => n.name);

  return (
    <div className="receipt" aria-live="polite">
      <b className="receipt__logo">FOODLAB</b>
      <p className="receipt__c">ul. Twoja Kuchnia 1<br />{printed}</p>
      <hr />
      <p className="receipt__c receipt__title">{RECIPE.title}</p>
      <p className="receipt__c receipt__muted">{RECIPE.time} · 1 porcja</p>
      <hr />
      {RECIPE.needs.map((n) => (
        <div key={n.name} className={`receipt__line${have.has(n.name) ? '' : ' is-missing'}`}>
          <span>{capital(n.name)}</span>
          <span>{have.has(n.name) ? 'JEST' : 'KUP'}</span>
        </div>
      ))}
      <hr />
      <div className="receipt__line"><span>Białko</span><span>{RECIPE.protein} g</span></div>
      <div className="receipt__line"><span>Węglowodany</span><span>{RECIPE.carbs} g</span></div>
      <div className="receipt__line"><span>Tłuszcz</span><span>{RECIPE.fat} g</span></div>
      <div className="receipt__line receipt__total"><span>RAZEM</span><span>{RECIPE.kcal} kcal</span></div>
      <hr />
      <div className="receipt__line">
        <span>Składniki w domu</span>
        <span className={percent >= 80 ? 'is-ok' : percent >= 50 ? 'is-mid' : 'is-bad'}>{percent}%</span>
      </div>
      <div className="receipt__line">
        <span>Do kupienia</span>
        <span>{missing.length ? `${missing.length} poz.` : '0 zł'}</span>
      </div>
      <div className="barcode" aria-hidden="true" />
      <p className="receipt__c receipt__thanks">*** DZIĘKUJEMY, SMACZNEGO ***</p>
    </div>
  );
}
