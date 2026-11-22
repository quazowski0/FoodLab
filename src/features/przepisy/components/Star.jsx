// Gwiazdka ulubionych (pusta albo wypełniona)
export default function Star({ filled }) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path d="M10 2.5l2.3 4.8 5.2.7-3.8 3.6.9 5.2L10 14.3 5.4 16.8l.9-5.2L2.5 8l5.2-.7z" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
