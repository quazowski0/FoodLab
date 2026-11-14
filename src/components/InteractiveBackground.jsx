import { useEffect, useRef } from 'react';

/*
  Interaktywne tło całej strony: "płynna aurora".
  Kilka dużych, rozmytych plam koloru powoli przelewa się po tle jak lawa,
  jedna z nich podąża za kursorem, a przy przewijaniu plamy przesuwają się z efektem głębi.

  Rysujemy w małej rozdzielczości (taniej dla procesora), a resztę robi rozmycie w CSS.

  Komponent ustawia też na <html> zmienne CSS, z których korzystają inne elementy:
  --mouse-x / --mouse-y  (od -1 do 1, środek ekranu = 0) – np. miska na stronie startowej
  --scroll               (przewinięcie strony w px, bez jednostki)
*/

const SCALE = 6; // 1 piksel płótna = 6 pikseli ekranu

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function readPalette() {
  const s = getComputedStyle(document.documentElement);
  const v = (name, fallback) => s.getPropertyValue(name).trim() || fallback;
  return {
    dark: document.documentElement.dataset.theme === 'dark',
    bg: v('--bg', '#f4f8f1'),
    cursor: v('--accent', '#1f9d55'),
    blobs: [v('--blob-1', '#a3e635'), v('--blob-2', '#34d399'), v('--blob-3', '#fde047'), v('--accent', '#1f9d55'), '#14b8a6'],
  };
}

function rgba(hex, a) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const calm = reducedMotion();

    let w = 0;
    let h = 0;
    let palette = readPalette();
    let frame = 0;
    let running = true;
    let scroll = window.scrollY;

    // każda plama ma własny tor (krzywa Lissajous) i tempo
    const blobs = palette.blobs.map((_, i) => ({
      phase: i * 1.7 + Math.random(),
      speed: 0.00009 + Math.random() * 0.00008,
      ax: 0.28 + Math.random() * 0.2,
      ay: 0.22 + Math.random() * 0.2,
      size: 0.34 + Math.random() * 0.14,
      depth: 0.15 + i * 0.08, // siła parallaxu przy przewijaniu
    }));

    // plama za kursorem: cel i wartość wygładzona
    const follow = { x: 0.7, y: 0.3, tx: 0.7, ty: 0.3, on: 0, active: false };

    const resize = () => {
      w = Math.max(1, Math.ceil(window.innerWidth / SCALE));
      h = Math.max(1, Math.ceil(window.innerHeight / SCALE));
      canvas.width = w;
      canvas.height = h;
    };

    const draw = (t) => {
      const time = calm ? 0 : t;
      const big = Math.max(w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = palette.dark ? 'lighter' : 'source-over';

      const alpha = palette.dark ? 0.24 : 0.32;
      blobs.forEach((b, i) => {
        const shift = (scroll * b.depth) / SCALE;
        const x = w * (0.5 + Math.cos(time * b.speed + b.phase) * b.ax);
        let y = h * (0.5 + Math.sin(time * b.speed * 1.3 + b.phase) * b.ay) - shift;
        y = ((y % (h * 1.6)) + h * 1.6) % (h * 1.6) - h * 0.3; // zawijanie przy długim przewijaniu
        const r = big * b.size;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(palette.blobs[i], alpha));
        g.addColorStop(1, rgba(palette.blobs[i], 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });

      // plama za kursorem
      follow.x += (follow.tx - follow.x) * 0.05;
      follow.y += (follow.ty - follow.y) * 0.05;
      follow.on += ((follow.active ? 1 : 0) - follow.on) * 0.05;
      if (follow.on > 0.01) {
        const x = follow.x * w;
        const y = follow.y * h;
        const r = big * 0.26;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(palette.cursor, (palette.dark ? 0.42 : 0.38) * follow.on));
        g.addColorStop(1, rgba(palette.cursor, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = (t) => {
      if (!running) return;
      draw(t);
      frame = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      follow.tx = e.clientX / window.innerWidth;
      follow.ty = e.clientY / window.innerHeight;
      if (!follow.active) {
        follow.x = follow.tx;
        follow.y = follow.ty;
        follow.active = true;
      }
      root.style.setProperty('--mouse-x', (follow.tx * 2 - 1).toFixed(3));
      root.style.setProperty('--mouse-y', (follow.ty * 2 - 1).toFixed(3));
    };
    const onLeave = () => {
      follow.active = false;
      root.style.setProperty('--mouse-x', '0');
      root.style.setProperty('--mouse-y', '0');
    };
    const onScroll = () => {
      scroll = window.scrollY;
      root.style.setProperty('--scroll', scroll.toFixed(0));
    };
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      running = !document.hidden;
      if (running) frame = requestAnimationFrame(loop);
    };

    // po zmianie trybu jasny/ciemny pobieramy nowe kolory
    const themeObserver = new MutationObserver(() => {
      palette = readPalette();
    });
    themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    resize();
    onScroll();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    frame = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="bg-fx" aria-hidden="true">
      <canvas ref={canvasRef} className="bg-fx__canvas" />
    </div>
  );
}
