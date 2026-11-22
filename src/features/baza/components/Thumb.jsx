import { useState } from 'react';

// Miniatura produktu. Gdy nie ma zdjęcia albo się nie wczyta, pokazuje kafelek z pierwszą literą nazwy.
export default function Thumb({ src, name, large = false }) {
  const [broken, setBroken] = useState(false);
  const cls = `pd-thumb ${large ? 'pd-thumb--lg' : ''}`;
  if (!src || broken) {
    return (
      <span className={`${cls} pd-thumb--empty`} aria-hidden="true">
        {String(name ?? '').trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return <img className={cls} src={src} alt="" loading="lazy" onError={() => setBroken(true)} />;
}
