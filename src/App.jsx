import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Summary from './pages/Summary.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import InteractiveBackground from './components/InteractiveBackground.jsx';
import Footer from './components/Footer.jsx';

// Widoki modułów (na razie zaślepki, każdy właściciel podmienia swój komponent)
const Pantry = () => (
  <section className="page">
    <h2>Spiżarnia (Olek)</h2>
    <p>Tu będzie dodawanie produktów i localStorage.</p>
  </section>
);
const ProductDatabase = () => (
  <section className="page">
    <h2>Baza Produktów (Michał)</h2>
    <p>Tu wjedzie wyszukiwarka z Open Food Facts.</p>
  </section>
);
const Recipes = () => (
  <section className="page">
    <h2>Przepisy i Lista (Krzysiek)</h2>
    <p>Tu będą kafelki z Spoonacular i lista zakupów.</p>
  </section>
);

const NotFound = () => (
  <section className="page page--center">
    <h2>Nie ma takiej strony</h2>
    <p>Sprawdź adres albo wróć na stronę główną.</p>
    <Link to="/" className="btn btn--primary">Strona główna</Link>
  </section>
);

const navItems = [
  { to: '/spizarnia', label: 'Spiżarnia' },
  { to: '/baza', label: 'Baza produktów' },
  { to: '/przepisy', label: 'Przepisy' },
  { to: '/podsumowanie', label: 'Filtry i makro' },
];

function AppShell() {
  const location = useLocation();

  return (
    <div className="app">
      <InteractiveBackground />
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/" className="brand" aria-label="FoodLab, strona główna">
            <img src="/favicon.svg" alt="" width="28" height="28" />
            <span>FoodLab</span>
          </Link>

          {/* Główna nawigacja projektu */}
          <nav className="nav" aria-label="Główna nawigacja">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="nav__link">
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      {/* Dynamiczne renderowanie widoków */}
      {/* key = adres, żeby każda podstrona wjeżdżała z animacją */}
      <main className="container main route-fade" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spizarnia" element={<Pantry />} />
          <Route path="/baza" element={<ProductDatabase />} />
          <Route path="/przepisy" element={<Recipes />} />
          <Route path="/podsumowanie" element={<Summary />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
