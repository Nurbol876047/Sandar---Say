import { motion } from 'framer-motion'

export default function Mascot({ className = '' }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 360 440"
      className={className}
      initial={{ y: 0 }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5a3a26" />
          <stop offset="55%" stopColor="#3c2416" />
          <stop offset="100%" stopColor="#2a1a10" />
        </linearGradient>
        <linearGradient id="hairShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8a6248" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8a6248" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9d2" />
          <stop offset="100%" stopColor="#f6d3ae" />
        </linearGradient>
        <linearGradient id="vest" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2d4ea8" />
          <stop offset="55%" stopColor="#203a87" />
          <stop offset="100%" stopColor="#152a68" />
        </linearGradient>
        <linearGradient id="tunic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eef3fb" />
        </linearGradient>
        <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe9ff" />
          <stop offset="100%" stopColor="#8fd3ff" />
        </linearGradient>
        <linearGradient id="braid" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a2f1f" />
          <stop offset="100%" stopColor="#2e1b11" />
        </linearGradient>
      </defs>

      {/* soft glow + grounding shadow */}
      <ellipse cx="180" cy="190" rx="155" ry="170" fill="url(#glow)" />
      <ellipse cx="180" cy="418" rx="110" ry="14" fill="#152a68" opacity="0.1" />

      {/* braid */}
      <path d="M116 148 Q86 235 106 338 Q113 360 133 354 Q117 252 142 162 Z" fill="url(#braid)" />
      <path d="M120 170 Q104 240 112 300" stroke="#1f130c" strokeWidth="3" opacity="0.4" fill="none" strokeLinecap="round" />
      <circle cx="110" cy="336" r="7" fill="#ffdce8" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="119" cy="354" r="7" fill="#8fd3ff" stroke="#ffffff" strokeWidth="1.5" />

      {/* body / tunic */}
      <path d="M98 432 L98 288 Q98 224 180 218 Q262 224 262 288 L262 432 Z" fill="url(#tunic)" />
      <path d="M98 432 L98 288 Q98 224 180 218 Q262 224 262 288 L262 432 Z" fill="none" stroke="#dbe6f5" strokeWidth="2" />

      {/* vest */}
      <path d="M128 432 L128 296 Q128 254 180 252 Q232 254 232 296 L232 432 Z" fill="url(#vest)" />
      <path d="M128 296 Q128 254 180 252 Q232 254 232 296" fill="none" stroke="#4a68b8" strokeWidth="2" opacity="0.6" />
      {/* vest ornamental trim */}
      <g opacity="0.85">
        {[138, 155, 172, 189, 206, 223].map((x, i) => (
          <path key={i} d={`M${x} 300 l6 7 l-6 7 l-6 -7 Z`} fill="#ffdce8" opacity={i % 2 === 0 ? 0.9 : 0.5} />
        ))}
      </g>
      {[310, 335, 360, 385, 410].map((y, i) => (
        <circle key={i} cx="180" cy={y} r="3.2" fill="#fff0b8" />
      ))}

      {/* tunic front placket */}
      <path d="M150 432 L150 268 L210 268 L210 432 Z" fill="url(#tunic)" />
      <rect x="150" y="268" width="60" height="16" rx="3" fill="#ffdce8" />
      <rect x="150" y="268" width="60" height="16" rx="3" fill="none" stroke="#f3b9cf" strokeWidth="1.5" />

      {/* arms */}
      <path d="M98 298 Q66 330 73 384 Q76 403 96 398 Q90 352 118 308 Z" fill="url(#tunic)" />
      <path d="M98 298 Q66 330 73 384" fill="none" stroke="#dbe6f5" strokeWidth="2" />
      <path d="M262 298 Q296 320 300 362" fill="none" stroke="#eef3fb" strokeWidth="27" strokeLinecap="round" />
      <path d="M262 298 Q296 320 300 362" fill="none" stroke="#dbe6f5" strokeWidth="2" strokeLinecap="round" />

      {/* tablet in hand */}
      <g transform="translate(248 328) rotate(8)">
        <rect x="-2" y="-2" width="58" height="76" rx="10" fill="#0f1f52" opacity="0.25" />
        <rect x="0" y="0" width="54" height="72" rx="8" fill="#203a87" />
        <rect x="6" y="8" width="42" height="52" rx="4" fill="url(#screen)" />
        <circle cx="27" cy="66" r="2.4" fill="#8fd3ff" />
      </g>

      {/* neck */}
      <path d="M163 186 Q180 200 197 186 L197 214 Q180 226 163 214 Z" fill="url(#skin)" />

      {/* head */}
      <circle cx="180" cy="148" r="63" fill="url(#skin)" />
      <ellipse cx="206" cy="150" rx="14" ry="20" fill="#f0bd8e" opacity="0.35" />

      {/* ears */}
      <circle cx="119" cy="152" r="9" fill="url(#skin)" />
      <circle cx="241" cy="152" r="9" fill="url(#skin)" />

      {/* hair back volume */}
      <path d="M113 150 Q100 80 180 62 Q260 80 247 150 Q238 95 180 92 Q122 95 113 150 Z" fill="url(#hair)" />
      <path d="M118 138 Q114 172 128 200 Q110 168 118 138 Z" fill="url(#hair)" />
      <path d="M242 138 Q246 172 232 200 Q250 168 242 138 Z" fill="url(#hair)" />
      {/* hair shine streak */}
      <path d="M140 80 Q180 66 222 82 Q182 76 140 80 Z" fill="url(#hairShine)" />

      {/* eyebrows */}
      <path d="M149 132 Q160 124 172 130" stroke="#3c2416" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M189 130 Q201 124 212 132" stroke="#3c2416" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* eyes */}
      <g>
        <ellipse cx="160" cy="152" rx="8" ry="9" fill="#ffffff" />
        <circle cx="160" cy="153" r="6" fill="#3c2416" />
        <circle cx="162.5" cy="150.5" r="2" fill="#ffffff" />
      </g>
      <g>
        <ellipse cx="202" cy="152" rx="8" ry="9" fill="#ffffff" />
        <circle cx="202" cy="153" r="6" fill="#3c2416" />
        <circle cx="204.5" cy="150.5" r="2" fill="#ffffff" />
      </g>
      <path d="M150 146 Q160 140 170 146" stroke="#2a1a10" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M192 146 Q202 140 212 146" stroke="#2a1a10" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />

      {/* nose + mouth */}
      <path d="M179 162 Q176 170 181 172" stroke="#e3a876" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M158 180 Q181 196 204 180 Q181 190 158 180 Z" fill="#c6744f" />
      <path d="M158 180 Q181 194 204 180" stroke="#a85a3c" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* blush */}
      <circle cx="144" cy="170" r="9" fill="#ffb9c9" opacity="0.55" />
      <circle cx="216" cy="170" r="9" fill="#ffb9c9" opacity="0.55" />

      {/* headband with ornament */}
      <path d="M118 116 Q180 92 242 116" stroke="#ffdce8" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M118 116 Q180 92 242 116" stroke="#f3b9cf" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
      <circle cx="180" cy="98" r="5.5" fill="#fff0b8" stroke="#e8c86a" strokeWidth="1.5" />
    </motion.svg>
  )
}
