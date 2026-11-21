import { DIFFICULTY_LABELS } from '../difficulty.js';

export default function DifficultyBadge({ level }) {
  return <span className={`mk-badge mk-badge--${level}`}>{DIFFICULTY_LABELS[level]}</span>;
}
