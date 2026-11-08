import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Pantry = () => <div><h2>Spiżarnia (Olek)</h2><p>Tu będzie dodawanie produktów i localStorage.</p></div>;
const ProductDatabase = () => <div><h2>Baza Produktów (Michał)</h2><p>Tu wjedzie wyszukiwarka z Open Food Facts.</p></div>;
const Recipes = () => <div><h2>Przepisy i Lista (Krzysiek)</h2><p>Tu będą kafelki z Spoonacular i lista zakupów.</p></div>;
const Summary = () => <div><h2>Podsumowanie (Maks)</h2><p>Tu będą suwaki kalorii i makro.</p></div>;

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>FoodLab</h1>
        
        {/* Główna nawigacja projektu */}
        <nav style={{ borderBottom: '1px solid #ccc', paddingBottom: '15px', marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '20px' }}>Spiżarnia</Link>
          <Link to="/baza" style={{ marginRight: '20px' }}>Baza Produktów</Link>
          <Link to="/przepisy" style={{ marginRight: '20px' }}>Przepisy</Link>
          <Link to="/podsumowanie">Filtry i Makro</Link>
        </nav>

        {/* Dynamiczne renderowanie widoków */}
        <Routes>
          <Route path="/" element={<Pantry />} />
          <Route path="/baza" element={<ProductDatabase />} />
          <Route path="/przepisy" element={<Recipes />} />
          <Route path="/podsumowanie" element={<Summary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;