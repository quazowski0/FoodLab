/*
  Ilustracja miski na stronie startowej (czyste SVG, bez obrazków).
  Warstwy .layer-* przesuwają się za kursorem z różną siłą (efekt głębi),
  korzystając ze zmiennych --mouse-x / --mouse-y ustawianych przez InteractiveBackground.
*/
export default function HeroBowl() {
  return (
    <svg viewBox="0 0 400 400" className="bowl-svg" role="img" aria-label="Miska pełna warzyw i owoców">
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

        {/* jedzenie: kopiec sałaty wypełniający miskę, na nim składniki.
            Wszystko stoi na kopcu (bez animacji unoszenia), a dolne części chowa przód miski. */}
        <g className="food">
          {/* kopiec sałaty od brzegu do brzegu */}
          <path d="M52 212 C62 166 120 140 200 136 C280 140 338 166 348 212 A148 35 0 0 1 52 212 Z" fill="#3f8f35" />
          <path d="M64 214 C74 176 126 152 200 148 C274 152 326 176 336 214 A136 30 0 0 1 64 214 Z" fill="url(#g-leaf)" />
          {/* postrzępione liście sałaty przy brzegu */}
          <path d="M56 214c4-14 14-22 26-20 2-12 16-18 26-12 6-10 20-12 28-4 8-8 22-6 28 4" fill="none" stroke="#2f7a2a" strokeWidth="3" strokeLinecap="round" />
          <path d="M344 214c-4-14-14-22-26-20-2-12-16-18-26-12-6-10-20-12-28-4" fill="none" stroke="#2f7a2a" strokeWidth="3" strokeLinecap="round" />
          <path d="M150 168c18-10 64-12 100 0M120 190c26-8 54-10 80-6M210 186c28-4 58 0 84 8" className="leaf-vein" />

          {/* słupki marchewki wbite w kopiec */}
          <g>
            <rect x="226" y="112" width="15" height="86" rx="7.5" transform="rotate(16 233 155)" fill="url(#g-carrot)" />
            <rect x="248" y="124" width="13" height="76" rx="6.5" transform="rotate(32 254 162)" fill="url(#g-carrot)" />
            <path d="M226 136h8M230 156h8M234 176h8" transform="rotate(16 233 155)" className="carrot-line" />
          </g>

          {/* awokado (połówka) */}
          <g transform="rotate(-16 266 196)">
            <ellipse cx="266" cy="196" rx="36" ry="44" fill="#2f5f26" />
            <ellipse cx="266" cy="197" rx="31" ry="39" fill="url(#g-avo)" />
            <circle cx="266" cy="207" r="15" fill="url(#g-pit)" />
            <ellipse cx="260" cy="201" rx="5" ry="3.5" fill="#fff" opacity="0.35" />
          </g>

          {/* pomidor */}
          <g>
            <circle cx="148" cy="184" r="35" fill="url(#g-tomato)" />
            <path d="M148 149l5 9 10-3-6 8 9 6-11 0-7 8-1-10-10-3 9-4Z" fill="#3f8f35" />
            <ellipse cx="134" cy="169" rx="10" ry="6" transform="rotate(-30 134 169)" fill="#fff" opacity="0.5" />
          </g>

          {/* pomidorki koktajlowe */}
          <circle cx="200" cy="208" r="15" fill="url(#g-cherry)" />
          <circle cx="224" cy="214" r="12" fill="url(#g-cherry)" />
          <circle cx="186" cy="182" r="11" fill="url(#g-cherry)" />
          <ellipse cx="195" cy="202" rx="4" ry="2.6" fill="#fff" opacity="0.5" />

          {/* jajko */}
          <g transform="rotate(-8 98 208)">
            <ellipse cx="98" cy="208" rx="29" ry="19" fill="#fffdf6" />
            <ellipse cx="98" cy="208" rx="29" ry="19" className="egg-edge" />
            <ellipse cx="100" cy="207" rx="12" ry="9" fill="url(#g-yolk)" />
          </g>

          {/* plaster cytryny */}
          <g transform="translate(310 208) rotate(-14)">
            <ellipse rx="29" ry="21" fill="#f2b705" />
            <ellipse rx="25" ry="18" fill="#fff6cf" />
            <ellipse rx="22" ry="15.5" fill="#ffd84a" />
            <path d="M0 0L22 0M0 0L11 13.5M0 0L-11 13.5M0 0L-22 0M0 0L-11-13.5M0 0L11-13.5" className="lemon-seg" />
          </g>

          {/* listki bazylii na wierzchu i ziarenka */}
          <path d="M192 150c6-14 22-18 32-12-6 12-20 18-32 12Z" fill="url(#g-leaf)" />
          <path d="M200 160c4-10 16-14 24-8-4 9-15 13-24 8Z" fill="#4f9f3d" />
          <g className="seeds">
            <ellipse cx="122" cy="204" rx="2" ry="1.2" />
            <ellipse cx="240" cy="200" rx="2" ry="1.2" transform="rotate(30 240 200)" />
            <ellipse cx="176" cy="200" rx="2" ry="1.2" transform="rotate(-20 176 200)" />
            <ellipse cx="294" cy="184" rx="2" ry="1.2" />
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

      </g>

      {/* iskierki najbliżej, przesuwają się najmocniej */}
      <g className="layer-front">
        <circle cx="70" cy="62" r="5" className="art-spark spark--1" />
        <circle cx="330" cy="42" r="4" className="art-spark spark--2" />
        <circle cx="372" cy="224" r="4.5" className="art-spark spark--3" />
      </g>
    </svg>
  );
}
