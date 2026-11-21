import { fmt } from '../nutrition.js';

const W = 640, H = 220, L = 48, R = 12, T = 22, B = 34;

// Kalorie z ostatnich 7 dni na tle celu (linia przerywana)
export default function WeekChart({ days, goalKcal }) {
  const ph = H - T - B;
  const pw = W - L - R;
  const top = Math.ceil((Math.max(goalKcal, ...days.map((d) => d.kcal)) * 1.12) / 500) * 500 || 500;
  const y = (v) => T + ph - (v / top) * ph;
  const slot = pw / days.length;
  const bw = Math.min(46, slot * 0.6);
  const grid = [];
  for (let g = 0; g <= top; g += 1000) grid.push(g);

  return (
    <svg className="mk-week" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Kalorie z ostatnich 7 dni względem celu">
      {grid.map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke="var(--border)" />
          <text x={L - 8} y={y(g) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{fmt(g)}</text>
        </g>
      ))}
      {days.map((d, i) => {
        const x = L + slot * i + (slot - bw) / 2;
        const today = i === days.length - 1;
        return (
          <g key={d.key}>
            {d.kcal > 0 && (
              <rect x={x} y={y(d.kcal)} width={bw} height={T + ph - y(d.kcal)} rx="6"
                fill={d.kcal > goalKcal ? 'var(--mk-mid)' : 'var(--accent)'} opacity={today ? 1 : 0.55} />
            )}
            <text x={x + bw / 2} y={(d.kcal > 0 ? y(d.kcal) : T + ph) - 6} textAnchor="middle" fontSize="11" fontWeight={today ? 700 : 500} fill={d.kcal ? 'var(--text-h)' : 'var(--muted)'}>
              {d.kcal ? fmt(d.kcal) : '–'}
            </text>
            <text x={x + bw / 2} y={H - 12} textAnchor="middle" fontSize="12" fontWeight={today ? 700 : 500} fill={today ? 'var(--text-h)' : 'var(--muted)'}>{d.label}</text>
          </g>
        );
      })}
      <line x1={L} x2={W - R} y1={y(goalKcal)} y2={y(goalKcal)} stroke="var(--text-h)" strokeWidth="1.5" strokeDasharray="5 5" />
      <text x={W - R} y={y(goalKcal) - 6} textAnchor="end" fontSize="11" fontWeight="700" fill="var(--text-h)">cel {fmt(goalKcal)}</text>
    </svg>
  );
}
