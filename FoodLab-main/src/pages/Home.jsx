import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroBowl from '../components/HeroBowl.jsx';

// Proste ikony liniowe (bez zewnętrznych bibliotek)
const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const icons = {
  pantry: (
    <Icon>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 10h16M4 16h16M9 6.5h6" />
    </Icon>
  ),
  search: (
    <Icon>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" />
    </Icon>
  ),
  recipe: (
    <Icon>
      <path d="M3 11h18a9 9 0 0 1-18 0Z" />
      <path d="M8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5" />
    </Icon>
  ),
  chart: (
    <Icon>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </Icon>
  ),
  arrow: (
    <Icon>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  ),
};

const modules = [
  {
    to: '/spizarnia',
    icon: icons.pantry,
    title: 'Wirtualna spiżarnia',
    text: 'Dodawaj produkty, które masz w domu, razem z ilością i datą ważności.',
    owner: 'Olek',
  },
  {
    to: '/baza',
    icon: icons.search,
    title: 'Baza produktów',
    text: 'Wyszukuj produkty w Open Food Facts i sprawdzaj ich wartości odżywcze.',
    owner: 'Michał',
  },
  {
    to: '/przepisy',
    icon: icons.recipe,
    title: 'Przepisy i lista zakupów',
    text: 'Zobacz, co ugotujesz z tego, co masz, i czego brakuje do wybranego dania.',
    owner: 'Krzysiek',
  },
  {
    to: '/podsumowanie',
    icon: icons.chart,
    title: 'Filtry i makro',
    text: 'Zawężaj przepisy po trudności i kaloriach, sprawdzaj makroskładniki.',
    owner: 'Maks',
  },
];

const steps = [
  { title: 'Uzupełnij spiżarnię', text: 'Wpisz produkty ręcznie albo znajdź je w bazie.' },
  { title: 'Wyszukaj przepisy', text: 'FoodLab dopasuje dania do Twoich składników.' },
  { title: 'Dobierz i ugotuj', text: 'Ustaw trudność i kalorie, a braki trafią na listę zakupów.' },
];

const stats = [
  { value: 4, suffix: '', label: 'moduły w jednej aplikacji' },
  { value: 2, suffix: '', label: 'darmowe bazy danych o jedzeniu' },
  { value: 100, suffix: '%', label: 'danych zostaje w Twojej przeglądarce' },
  { value: 0, suffix: ' zł', label: 'kosztuje korzystanie' },
];

const ingredients = [
  'pomidory', 'jajka', 'makaron', 'ser', 'cebula', 'czosnek', 'kurczak', 'ryż',
  'papryka', 'szpinak', 'jogurt', 'cytryna', 'ziemniaki', 'marchewka', 'fasola', 'bazylia',
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Dodaje klasę .is-visible, gdy element wjedzie w ekran (animacje przy przewijaniu)
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

// Liczba, która "odlicza" od zera, gdy pojawi się na ekranie
function CountUp({ to, suffix }) {
  const ref = useRef(null);
  // bez animacji (ograniczony ruch / stara przeglądarka) od razu pokazujemy wynik
  const [animate] = useState(
    () => !prefersReducedMotion() && typeof window !== 'undefined' && 'IntersectionObserver' in window,
  );
  const [value, setValue] = useState(animate ? 0 : to);

  useEffect(() => {
    const el = ref.current;
    if (!el || !animate) return;
    let frame;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const duration = 1200;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(to * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, animate]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

// Kafelek, który lekko się przechyla i podświetla w miejscu kursora
function TiltCard({ to, children, delay }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    el.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <Link
      ref={ref}
      to={to}
      className="card reveal"
      style={{ '--delay': `${delay}ms` }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </Link>
  );
}

export default function Home() {
  const pageRef = useReveal();

  return (
    <div className="home" ref={pageRef}>
      <section className="hero">
        <div className="hero__text">
          <span className="eyebrow hero-in" style={{ '--delay': '0ms' }}>
            <span className="eyebrow__dot" /> Twoja kuchnia, lepiej zaplanowana
          </span>
          <h1 className="hero-in" style={{ '--delay': '80ms' }}>
            Ugotuj coś dobrego z tego, <span className="gradient-text">co już masz</span>
          </h1>
          <p className="lead hero-in" style={{ '--delay': '160ms' }}>
            FoodLab zapamiętuje produkty z Twojej kuchni, podpowiada pasujące przepisy
            i pokazuje, ile kalorii i makroskładników ma każde danie.
          </p>
          <div className="hero__actions hero-in" style={{ '--delay': '240ms' }}>
            <Link to="/spizarnia" className="btn btn--primary">
              Otwórz spiżarnię <span className="btn__icon">{icons.arrow}</span>
            </Link>
            <Link to="/przepisy" className="btn btn--ghost">Szukaj przepisów</Link>
          </div>
        </div>

        <div className="hero__art hero-in" style={{ '--delay': '200ms' }}>
          <div className="hero__glow" />
          <HeroBowl />
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...ingredients, ...ingredients].map((item, i) => (
            <span key={i} className="marquee__item">{item}</span>
          ))}
        </div>
      </div>

      <section className="stats">
        {stats.map((s, i) => (
          <div key={s.label} className="stat reveal" style={{ '--delay': `${i * 80}ms` }}>
            <strong className="stat__value"><CountUp to={s.value} suffix={s.suffix} /></strong>
            <span className="stat__label">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section__head reveal">
          <span className="kicker">Moduły</span>
          <h2>Co znajdziesz w aplikacji</h2>
        </div>
        <div className="cards">
          {modules.map((m, i) => (
            <TiltCard key={m.to} to={m.to} delay={i * 90}>
              <span className="card__icon" aria-hidden="true">{m.icon}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
              <span className="card__meta">
                Moduł: {m.owner} <span className="card__arrow" aria-hidden="true">{icons.arrow}</span>
              </span>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head reveal">
          <span className="kicker">Krok po kroku</span>
          <h2>Jak to działa</h2>
        </div>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.title} className="step reveal" style={{ '--delay': `${i * 120}ms` }}>
              <span className="step__num">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta reveal">
        <div>
          <h2>Zajrzyj do lodówki i zacznij</h2>
          <p>Dodaj kilka produktów, a FoodLab podpowie, co z nich zrobić.</p>
        </div>
        <Link to="/spizarnia" className="btn btn--light">
          Dodaj pierwsze produkty <span className="btn__icon">{icons.arrow}</span>
        </Link>
      </section>
    </div>
  );
}
