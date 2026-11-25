import { Link } from 'react-router-dom';

const REPO_URL = 'https://github.com/quazowski0/FoodLab';

const appLinks = [
  { label: 'Spiżarnia', to: '/spizarnia' },
  { label: 'Baza produktów', to: '/spizarnia?zakladka=baza' },
  { label: 'Przepisy', to: '/przepisy' },
  { label: 'Filtry i makro', to: '/podsumowanie' },
];

const extLinks = [
  { label: 'Open Food Facts', href: 'https://world.openfoodfacts.org/' },
  { label: 'Spoonacular', href: 'https://spoonacular.com/food-api' },
  { label: 'GitHub', href: REPO_URL },
  { label: 'Zgłoś błąd', href: `${REPO_URL}/issues` },
];

// Stopka jak dół paragonu: kod kreskowy, linki i krótka notka
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="barcode site-footer__code" aria-hidden="true" />
        <p className="site-footer__name">FoodLab · {year}</p>
        <nav className="site-footer__links" aria-label="Aplikacja">
          {appLinks.map((l) => (
            <Link key={l.label} to={l.to}>{l.label}</Link>
          ))}
        </nav>
        <nav className="site-footer__links site-footer__links--ext" aria-label="Źródła danych i kod">
          {extLinks.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
          ))}
        </nav>
        <p className="site-footer__note">Zachowaj paragon. Dane są tylko w Twojej przeglądarce.</p>
        <button
          type="button"
          className="to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Do góry
        </button>
      </div>
    </footer>
  );
}
