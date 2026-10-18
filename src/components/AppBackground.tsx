export default function AppBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-brand-skylight">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bfe6ff" />
            <stop offset="55%" stopColor="#e8f4ff" />
            <stop offset="100%" stopColor="#fffdf8" />
          </linearGradient>
          <linearGradient id="mountainsFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c7dcf6" />
            <stop offset="100%" stopColor="#aecdf0" />
          </linearGradient>
          <linearGradient id="mountainsNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fc6ef" />
            <stop offset="100%" stopColor="#8fd3ff" />
          </linearGradient>
          <linearGradient id="hills" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bdeec7" />
            <stop offset="100%" stopColor="#cff5d5" />
          </linearGradient>
          <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bfe6ff" />
            <stop offset="100%" stopColor="#8fd3ff" />
          </linearGradient>
        </defs>

        <rect width="1440" height="900" fill="url(#sky)" />

        <circle cx="1240" cy="120" r="64" fill="#fff0b8" opacity="0.9" />
        <circle cx="1240" cy="120" r="88" fill="#fff0b8" opacity="0.35" />

        <g className="animate-drift" opacity="0.85">
          {[
            [120, 110, 1],
            [520, 70, 0.8],
            [980, 150, 1.1],
            [1600, 100, 0.9],
            [2000, 60, 0.7],
          ].map(([cx, cy, scale], i) => (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${scale})`} fill="#ffffff">
              <ellipse cx="0" cy="0" rx="46" ry="20" />
              <ellipse cx="32" cy="-8" rx="30" ry="18" />
              <ellipse cx="-34" cy="-4" rx="28" ry="16" />
            </g>
          ))}
        </g>

        <path
          d="M0 420 L120 320 L230 400 L340 280 L470 410 L600 300 L740 420 L860 330 L1000 410 L1140 310 L1280 420 L1440 340 L1440 560 L0 560 Z"
          fill="url(#mountainsFar)"
        />
        <path
          d="M0 500 L0 500 L160 390 L300 480 L440 360 L600 490 L760 380 L920 480 L1100 370 L1260 480 L1440 400 L1440 620 L0 620 Z"
          fill="url(#mountainsNear)"
          opacity="0.9"
        />
        {[260, 600, 980].map((x, i) => (
          <path key={i} d={`M${x} ${430 - i * 10} L${x + 30} ${390 - i * 10} L${x + 60} ${430 - i * 10} Z`} fill="#ffffff" opacity="0.8" />
        ))}

        <path d="M0 560 Q 360 480 720 560 T 1440 560 L1440 900 L0 900 Z" fill="url(#hills)" />

        <ellipse cx="300" cy="700" rx="320" ry="80" fill="url(#lake)" opacity="0.85" />
        <ellipse cx="300" cy="700" rx="320" ry="80" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="3" />

        <g opacity="0.9">
          <path d="M1120 760 L1120 680 L1170 630 L1220 680 L1220 760 Z" fill="#fffdf8" stroke="#e9dfff" strokeWidth="3" />
          <path d="M1108 690 L1170 615 L1232 690 Z" fill="#e9dfff" />
          <rect x="1160" y="710" width="20" height="50" rx="3" fill="#cfa15c" />
        </g>

        <g>
          {[
            [90, 820, '#ffdce8'],
            [160, 850, '#fff0b8'],
            [230, 810, '#e9dfff'],
            [1300, 830, '#ffdce8'],
            [1370, 800, '#cff5d5'],
          ].map(([cx, cy, color], i) => (
            <g key={i} transform={`translate(${cx} ${cy})`}>
              <line x1="0" y1="0" x2="0" y2="18" stroke="#8fcf8f" strokeWidth="3" />
              {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse
                  key={angle}
                  cx={Math.cos((angle * Math.PI) / 180) * 7}
                  cy={Math.sin((angle * Math.PI) / 180) * 7}
                  rx="6"
                  ry="4"
                  fill={color as string}
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle r="4" fill="#fff0b8" />
            </g>
          ))}
        </g>

        <path d="M0 860 Q 720 820 1440 860 L1440 900 L0 900 Z" fill="#cff5d5" opacity="0.6" />
      </svg>
    </div>
  )
}
