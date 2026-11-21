/*
  Ilustracja miski na stronie startowej (czyste SVG, bez obrazków).
  Warstwy .layer-* przesuwają się za kursorem z różną siłą (efekt głębi),
  korzystając ze zmiennych --mouse-x / --mouse-y ustawianych przez InteractiveBackground.
*/
export default function HeroBowl() {
  return (
    <svg viewBox="0 0 400 400" className="bowl-svg" role="img" aria-label="Miska pełna warzyw">
      <defs>
        <radialGradient id="g-disc" cx="50%" cy="45%" r="55%">
          <stop offset="0%" className="stop-disc-1" />
          <stop offset="100%" className="stop-disc-2" />
        </radialGradient>
        <linearGradient id="g-body" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#dfe6e0" />
          <stop offset="30%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#f3f6f3" />
          <stop offset="100%" stopColor="#bfcbc2" />
        </linearGradient>
        <linearGradient id="g-body-shade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b1f12" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id="g-inside" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e4ebe5" />
          <stop offset="100%" stopColor="#aebdb2" />
        </radialGradient>
        <radialGradient id="g-tomato" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ff8c6e" />
          <stop offset="55%" stopColor="#e8452c" />
          <stop offset="100%" stopColor="#a92a19" />
        </radialGradient>
        <radialGradient id="g-cherry" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ff7a6a" />
          <stop offset="60%" stopColor="#d93a2b" />
          <stop offset="100%" stopColor="#9c2116" />
        </radialGradient>
        <radialGradient id="g-avo" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#f4f9bf" />
          <stop offset="70%" stopColor="#c8e27c" />
          <stop offset="100%" stopColor="#8fbf45" />
        </radialGradient>
        <radialGradient id="g-pit" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#b8794a" />
          <stop offset="100%" stopColor="#5e3416" />
        </radialGradient>
        <radialGradient id="g-yolk" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffd25e" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <linearGradient id="g-leaf" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#7fd05c" />
          <stop offset="100%" stopColor="#3b8a32" />
        </linearGradient>
        <linearGradient id="g-carrot" x1="0" x2="1">
          <stop offset="0%" stopColor="#ffa24c" />
          <stop offset="100%" stopColor="#e8701c" />
        </linearGradient>
        <filter id="f-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="f-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <clipPath id="c-body">
          <path d="M50 210 A150 36 0 0 0 350 210 C350 292 285 342 200 342 C115 342 50 292 50 210Z" />
        </clipPath>
      </defs>

      {/* tło: dysk i obracający się pierścień */}
      <g className="layer-back">
        <circle cx="200" cy="200" r="168" fill="url(#g-disc)" />
        <circle cx="200" cy="200" r="186" className="bowl-ring" />
        <circle cx="200" cy="200" r="150" className="bowl-ring bowl-ring--inner" />
      </g>

      {/* składniki unoszące się dalej od miski */}
      <g className="layer-back">
        <g className="float float--a">
          <path d="M58 118c10-22 34-28 50-22-8 20-30 30-50 22Z" fill="url(#g-leaf)" />
          <path d="M60 117c14-6 28-12 46-20" className="leaf-vein" />
        </g>
        <g className="float float--c">
          <circle cx="344" cy="104" r="11" fill="url(#g-cherry)" />
          <path d="M340 93l4 4 4-4" className="stem" />
        </g>
      </g>

      <g className="layer-bowl">
        {/* cień pod miską */}
        <ellipse cx="200" cy="362" rx="128" ry="14" className="bowl-shadow" filter="url(#f-blur)" />

        {/* stópka */}
        <path d="M148 332 Q200 342 252 332 L262 354 Q200 366 138 354Z" fill="#cdd7cf" />
        <path d="M138 354 Q200 366 262 354" className="foot-edge" />

        {/* wnętrze miski */}
        <ellipse cx="200" cy="210" rx="150" ry="36" fill="url(#g-inside)" />
        <path d="M50 210 A150 36 0 0 1 350 210" className="rim-back" />
        <ellipse cx="200" cy="218" rx="122" ry="22" fill="#0b1f12" opacity="0.22" filter="url(#f-soft)" />

        {/* jedzenie */}
        <g className="food">
          {/* sałata w tle */}
          <ellipse cx="128" cy="190" rx="50" ry="22" transform="rotate(-22 128 190)" fill="#4f9f3d" />
          <ellipse cx="276" cy="186" rx="54" ry="22" transform="rotate(20 276 186)" fill="#5bb046" />
          <ellipse cx="204" cy="176" rx="60" ry="24" fill="#67bd4c" />
          <path d="M160 176c20-8 60-10 92 0" className="leaf-vein" />

          {/* słupki marchewki */}
          <g className="float float--d">
            <rect x="232" y="96" width="15" height="92" rx="7.5" transform="rotate(18 240 142)" fill="url(#g-carrot)" />
            <rect x="252" y="110" width="13" height="80" rx="6.5" transform="rotate(34 258 150)" fill="url(#g-carrot)" />
            <path d="M232 120h8M236 140h8M240 160h8" transform="rotate(18 240 142)" className="carrot-line" />
          </g>

          {/* awokado */}
          <g transform="rotate(-16 262 176)">
            <ellipse cx="262" cy="176" rx="38" ry="47" fill="#2f5f26" />
            <ellipse cx="262" cy="177" rx="33" ry="42" fill="url(#g-avo)" />
            <circle cx="262" cy="188" r="16" fill="url(#g-pit)" />
            <ellipse cx="256" cy="182" rx="5" ry="3.5" fill="#fff" opacity="0.35" />
          </g>

          {/* pomidor */}
          <g className="float float--b">
            <circle cx="146" cy="168" r="37" fill="url(#g-tomato)" />
            <path d="M146 131l5 9 10-3-6 8 9 6-11 0-7 8-1-10-10-3 9-4Z" fill="#3f8f35" />
            <ellipse cx="131" cy="152" rx="10" ry="6" transform="rotate(-30 131 152)" fill="#fff" opacity="0.5" />
          </g>

          {/* pomidorki koktajlowe */}
          <circle cx="198" cy="198" r="15" fill="url(#g-cherry)" />
          <circle cx="222" cy="205" r="12" fill="url(#g-cherry)" />
          <ellipse cx="193" cy="192" rx="4" ry="2.6" fill="#fff" opacity="0.5" />

          {/* jajko */}
          <g transform="rotate(-8 96 198)">
            <ellipse cx="96" cy="198" rx="29" ry="19" fill="#fffdf6" />
            <ellipse cx="96" cy="198" rx="29" ry="19" className="egg-edge" />
            <ellipse cx="98" cy="197" rx="12" ry="9" fill="url(#g-yolk)" />
          </g>

          {/* plaster cytryny */}
          <g transform="translate(306 196) rotate(-14)">
            <ellipse rx="31" ry="23" fill="#f2b705" />
            <ellipse rx="27" ry="19.5" fill="#fff6cf" />
            <ellipse rx="24" ry="17" fill="#ffd84a" />
            <path d="M0 0L24 0M0 0L12 14.7M0 0L-12 14.7M0 0L-24 0M0 0L-12-14.7M0 0L12-14.7" className="lemon-seg" />
          </g>

          {/* listki bazylii i ziarenka */}
          <path d="M168 140c6-14 22-18 32-12-6 12-20 18-32 12Z" fill="url(#g-leaf)" />
          <path d="M178 150c4-10 16-14 24-8-4 9-15 13-24 8Z" fill="#4f9f3d" />
          <g className="seeds">
            <ellipse cx="120" cy="190" rx="2" ry="1.2" />
            <ellipse cx="236" cy="190" rx="2" ry="1.2" transform="rotate(30 236 190)" />
            <ellipse cx="180" cy="186" rx="2" ry="1.2" transform="rotate(-20 180 186)" />
            <ellipse cx="290" cy="170" rx="2" ry="1.2" />
          </g>
        </g>

        {/* przód miski */}
        <path d="M50 210 A150 36 0 0 0 350 210 C350 292 285 342 200 342 C115 342 50 292 50 210Z" fill="url(#g-body)" />
        <path d="M50 210 A150 36 0 0 0 350 210 C350 292 285 342 200 342 C115 342 50 292 50 210Z" fill="url(#g-body-shade)" />
        <g clipPath="url(#c-body)">
          <path d="M60 262 A140 40 0 0 0 340 262" className="bowl-band" />
          <path d="M66 276 A134 38 0 0 0 334 276" className="bowl-band bowl-band--thin" />
          <path d="M78 250 C90 288 124 314 164 326" className="bowl-gloss" />
        </g>
        <path d="M50 210 A150 36 0 0 0 350 210" className="rim-front" />

        {/* para nad jedzeniem */}
        <g className="steam">
          <path d="M170 96c-12-14 10-24-2-40" />
          <path d="M204 86c-12-14 10-24-2-40" />
          <path d="M238 96c-12-14 10-24-2-40" />
        </g>
      </g>

      {/* składniki najbliżej, przesuwają się najmocniej */}
      <g className="layer-front">
        <g className="float float--b">
          <g transform="translate(352 300) rotate(24)">
            <path d="M-20 0 A20 20 0 0 1 20 0Z" fill="#f2b705" />
            <path d="M-16 0 A16 16 0 0 1 16 0Z" fill="#ffd84a" />
            <path d="M0 0L0-16M0 0L-11-11M0 0L11-11" className="lemon-seg" />
          </g>
        </g>
        <g className="float float--a">
          <path d="M34 286c4-16 20-24 34-18-4 16-20 24-34 18Z" fill="url(#g-leaf)" />
        </g>
        <circle cx="70" cy="62" r="5" className="art-spark spark--1" />
        <circle cx="330" cy="42" r="4" className="art-spark spark--2" />
        <circle cx="372" cy="224" r="4.5" className="art-spark spark--3" />
      </g>
    </svg>
  );
}
