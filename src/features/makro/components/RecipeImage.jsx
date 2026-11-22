import { useState } from 'react';

// Zdjęcie dania; przykładowe przepisy i zepsute linki dostają kafelek z pierwszą literą
export default function RecipeImage({ recipe, className, fallback = true }) {
  const [broken, setBroken] = useState(false);
  if (recipe.image && !broken) {
    return <img className={className} src={recipe.image} alt="" loading="lazy" onError={() => setBroken(true)} />;
  }
  if (!fallback) return null;
  return <span className={`${className} mk-img--empty`} aria-hidden="true">{recipe.title.charAt(0)}</span>;
}
