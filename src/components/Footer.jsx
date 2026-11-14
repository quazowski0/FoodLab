import { useState } from 'react';
import { Link } from 'react-router-dom';

const REPO_URL = 'https://github.com/quazowski0/FoodLab';

const columns = [
  {
    title: 'Aplikacja',
    links: [
      { label: 'Spiżarnia', to: '/spizarnia' },
      { label: 'Baza produktów', to: '/baza' },
      { label: 'Przepisy i lista zakupów', to: '/przepisy' },
      { label: 'Filtry i makro', to: '/podsumowanie' },
    ],
  },
  {
    title: 'Źródła danych',
    links: [
      { label: 'Open Food Facts', href: 'https://world.openfoodfacts.org/' },
      { label: 'Spoonacular API', href: 'https://spoonacular.com/food-api' },
      { label: 'Kod źródłowy', href: REPO_URL },
      { label: 'Zgłoś błąd', href: `${REPO_URL}/issues` },
    ],
  },
];

// Profile społecznościowe: GitHub prowadzi do repo, pozostałe podmieńcie na swoje adresy
const socials = [
  {
    label: 'GitHub',
    href: REPO_URL,
    path: 'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z',
  },
  {
    label: 'Instagram',
    href: '#',
    path: 'M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  },
  {
    label: 'TikTok',
    href: '#',
    path: 'M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z',
  },
  {
    label: 'YouTube',
    href: '#',
    path: 'M21.6 7.2a2.5 2.5 0 0 0-1.77-1.77C18.27 5 12 5 12 5s-6.27 0-7.83.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.77 1.77C5.73 19 12 19 12 19s6.27 0 7.83-.43a2.5 2.5 0 0 0 1.77-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z',
  },
];

function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  // Aplikacja nie ma backendu, więc formularz tylko potwierdza zapis (nic nie jest wysyłane)
  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <p className="newsletter__done" role="status">
        Dzięki! Damy znać na <strong>{email}</strong>, gdy pojawią się nowe funkcje.
      </p>
    );
  }

  return (
    <form className="newsletter" onSubmit={onSubmit}>
      <label htmlFor="newsletter-email" className="sr-only">Adres e-mail</label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="twoj@email.pl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn btn--primary">Zapisz się</button>
    </form>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link to="/" className="brand">
              <img src="/favicon.svg" alt="" width="32" height="32" />
              <span>FoodLab</span>
            </Link>
            <p>
              Wirtualna spiżarnia, przepisy z tego, co masz w kuchni, i podgląd makroskładników
              w jednym miejscu.
            </p>
            <div className="socials">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="social"
                  aria-label={s.label}
                  title={s.label}
                  {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} className="site-footer__col" aria-label={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to}>{l.label}</Link>
                    ) : (
                      <a href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="site-footer__news">
            <h3>Newsletter</h3>
            <p>Nowe funkcje i przepisy raz w miesiącu. Zero spamu.</p>
            <Newsletter />
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {year} FoodLab. Wszelkie prawa zastrzeżone.</span>
          <span className="site-footer__note">Twoje dane zostają w Twojej przeglądarce.</span>
          <button
            type="button"
            className="to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Do góry
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
