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
            <stop offset="0%" stopColor="#9fd9ff" />
            <stop offset="50%" stopColor="#dff0ff" />
            <stop offset="100%" stopColor="#fffdf8" />
          </linearGradient>
          <linearGradient id="mountainsFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c6a8f5" />
            <stop offset="100%" stopColor="#a8c3f5" />
          </linearGradient>
          <linearGradient id="mountainsNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6fc4ff" />
            <stop offset="100%" stopColor="#35d6c8" />
          </linearGradient>
          <linearGradient id="hills" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8be8a8" />
            <stop offset="100%" stopColor="#cff5d5" />
          </linearGradient>
          <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bfe6ff" />
            <stop offset="100%" stopColor="#35b8ff" />
          </linearGradient>
          <linearGradient id="rainbowArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff5fa8" />
            <stop offset="20%" stopColor="#ff8a65" />
            <stop offset="40%" stopColor="#ffd23f" />
            <stop offset="60%" stopColor="#3fe0a5" />
            <stop offset="80%" stopColor="#35d6c8" />
            <stop offset="100%" stopColor="#a86bff" />
          </linearGradient>
        </defs>

        <rect width="1440" height="900" fill="url(#sky)" />

        <path
          d="M -80 430 A 560 560 0 0 1 1520 430"
          fill="none"
          stroke="url(#rainbowArc)"
          strokeWidth="26"
          strokeLinecap="round"
          opacity="0.55"
        />

        <circle cx="1240" cy="120" r="64" fill="#ffd23f" opacity="0.95" />
        <circle cx="1240" cy="120" r="92" fill="#ffb13c" opacity="0.3" />
        {[
          [205, 40, '#ff5fa8'],
          [60, 230, '#a86bff'],
          [1120, 230, '#3fe0a5'],
          [40, 520, '#ff8a65'],
          [1380, 480, '#35d6c8'],
        ].map(([cx, cy, color], i) => (
          <g key={`spark-${i}`} className="animate-pulse-soft" style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: `${i * 0.4}s` }}>
            <path
              d={`M${cx} ${Number(cy) - 14} L${Number(cx) + 4} ${Number(cy) - 4} L${Number(cx) + 14} ${cy} L${Number(cx) + 4} ${Number(cy) + 4} L${cx} ${Number(cy) + 14} L${Number(cx) - 4} ${Number(cy) + 4} L${Number(cx) - 14} ${cy} L${Number(cx) - 4} ${Number(cy) - 4} Z`}
              fill={color as string}
              opacity="0.8"
            />
          </g>
        ))}

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
            [90, 820, '#ff5fa8'],
            [160, 850, '#ffd23f'],
            [230, 810, '#a86bff'],
            [1300, 830, '#ff8a65'],
            [1370, 800, '#3fe0a5'],
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
