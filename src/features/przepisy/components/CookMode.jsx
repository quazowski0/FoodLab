import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Krótki sygnał po końcu minutnika (bez plików dźwiękowych). Gdy przeglądarka blokuje dźwięk, po prostu cisza.
function beep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    [0, 0.35, 0.7].forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.2, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.25);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    /* brak Web Audio */
  }
  navigator.vibrate?.([200, 100, 200]);
}

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Minutnik kroku: odliczanie, pauza, reset
function Timer({ minutes }) {
  const total = Math.round(minutes * 60);
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const done = left === 0;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false);
          beep();
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className={`rc-timer ${done ? 'is-done' : ''}`} role="timer" aria-live="polite">
      <span className="rc-timer__time">{done ? 'Gotowe!' : mmss(left)}</span>
      {!done && (
        <button type="button" className="rc-btn rc-btn--primary rc-btn--sm" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pauza' : left === total ? `Start ${minutes} min` : 'Wznów'}
        </button>
      )}
      {left !== total && (
        <button type="button" className="rc-btn rc-btn--ghost rc-btn--sm" onClick={() => { setRunning(false); setLeft(total); }}>Od nowa</button>
      )}
    </div>
  );
}

// Tryb gotowania: jeden krok na ekranie, duży tekst, minutnik przy krokach z czasem, strzałki na klawiaturze
export default function CookMode({ title, steps, meta = [], onClose }) {
  const [i, setI] = useState(0);
  const dialogRef = useRef(null);
  const last = steps.length - 1;
  const go = useCallback((d) => setI((x) => Math.min(last, Math.max(0, x + d))), [last]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    // ekran nie gaśnie w trakcie gotowania (gdy przeglądarka pozwala)
    let lock = null;
    navigator.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lock?.release().catch(() => {});
    };
  }, [go, onClose]);

  const m = meta[i];
  // portal do <body>: nadrzędne elementy z animacją (transform) psułyby position: fixed
  return createPortal(
    <div className="rc-cook" role="dialog" aria-modal="true" aria-label={`Tryb gotowania: ${title}`} tabIndex={-1} ref={dialogRef}>
      <div className="rc-cook__top">
        <span className="rc-cook__title">{title}</span>
        <button type="button" className="rc-btn rc-btn--ghost rc-btn--sm" onClick={onClose}>Zamknij</button>
      </div>
      <div className="rc-cook__progress" aria-hidden="true"><i style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>
      <div className="rc-cook__body">
        <p className="rc-cook__count">Krok {i + 1} z {steps.length}</p>
        <p className="rc-cook__step">{steps[i]}</p>
        {(m?.tempC || m?.equipment?.length > 0) && (
          <p className="rc-step__tags">
            {m.tempC && <span className="rc-step__tag rc-step__tag--key">{m.tempC}°C</span>}
            {m.equipment.map((e) => <span key={e} className="rc-step__tag">{e}</span>)}
          </p>
        )}
        {m?.minutes ? <Timer key={i} minutes={m.minutes} /> : null}
      </div>
      <div className="rc-cook__nav">
        <button type="button" className="rc-btn rc-btn--ghost" onClick={() => go(-1)} disabled={i === 0}>← Poprzedni</button>
        {i < last ? (
          <button type="button" className="rc-btn rc-btn--primary" onClick={() => go(1)}>Następny krok →</button>
        ) : (
          <button type="button" className="rc-btn rc-btn--primary" onClick={onClose}>Skończone</button>
        )}
      </div>
    </div>,
    document.body,
  );
}
