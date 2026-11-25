import { useState } from 'react';
import { CATEGORIES } from '../categories.js';

// Ikony liniowe dla przepisów bez zdjęcia (przykładowe przepisy nie mają obrazków,
// zdjęcia przychodzą dopiero ze Spoonacular)
const ICONS = {
  // miska z parą
  sniadanie: (
    <>
      <path d="M8 26h48a24 24 0 0 1-48 0Z" />
      <path d="M22 18c0-4 3-5 3-9M32 18c0-4 3-5 3-9M42 18c0-4 3-5 3-9" />
    </>
  ),
  // talerz ze sztućcami
  obiad: (
    <>
      <circle cx="32" cy="32" r="16" />
      <circle cx="32" cy="32" r="9" />
      <path d="M8 14v12a3 3 0 0 0 6 0V14M11 26v24M56 14c-4 2-5 8-5 14h5v22" />
    </>
  ),
  // patelnia z jajkiem
  kolacja: (
    <>
      <circle cx="26" cy="34" r="16" />
      <path d="M42 34h16" />
      <path d="M20 34a6 6 0 0 1 6-6c4 0 7 2 7 6s-3 5-7 5-6-1-6-5Z" />
    </>
  ),
  // szklanka z koktajlem
  przekaski: (
    <>
      <path d="M18 18h28l-4 36H22Z" />
      <path d="M20 30h24M36 18l6-10" />
    </>
  ),
  // kawałek ciasta
  desery: (
    <>
      <path d="M8 46 46 22l10 8v16Z" />
      <path d="M8 46h48M14 38l34-20M44 14v6" />
    </>
  ),
};

const LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

// Zdjęcie dania; przykładowe przepisy i zepsute linki dostają kafelek z ikoną kategorii
export default function RecipeImage({ recipe, className, fallback = true }) {
  const [broken, setBroken] = useState(false);
  if (recipe.image && !broken) {
    return <img className={className} src={recipe.image} alt="" loading="lazy" onError={() => setBroken(true)} />;
  }
  if (!fallback) return null;
  const cat = recipe.categories?.find((c) => ICONS[c]) ?? 'obiad';
  return (
    <span className={`${className} mk-img--empty`} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[cat]}
      </svg>
      <small>{LABELS[cat] ?? 'Przepis'}</small>
    </span>
  );
}
