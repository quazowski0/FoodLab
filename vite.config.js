import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Wyszukiwarka Open Food Facts (cgi/search.pl) nie wysyła nagłówków CORS,
// więc przeglądarka blokuje ją z localhost. Serwer deweloperski Vite przekazuje
// zapytania z /off/... do Open Food Facts, a przeglądarka widzi to jako ten sam adres.
const offProxy = {
  '/off': {
    target: 'https://world.openfoodfacts.org',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/off/, ''),
    headers: { 'User-Agent': 'FoodLab/1.0 (projekt studencki)' },
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: offProxy },
  preview: { proxy: offProxy },
})
