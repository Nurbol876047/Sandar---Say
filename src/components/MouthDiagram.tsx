/** Simplified side-view (sagittal) mouth diagrams used to show where the tongue goes for each sound. */
export type TonguePosition = 'teeth' | 'palate' | 'flat'
export type LipShape = 'neutral' | 'smile' | 'round'

const HEAD_PATH =
  'M40 112 C40 62 80 22 128 26 C150 28 162 46 168 66 C172 79 185 86 188 96 C190 101 184 105 176 104 L170 110 L170 128 C170 132 166 136 160 140 C150 148 140 152 133 160 C125 170 120 176 114 182 C100 196 70 196 55 181 C40 166 35 140 40 112 Z'

// Drawn as a thick rounded stroke so the raised end (front tip vs. back) reads at a glance.
const TONGUE_PATHS: Record<TonguePosition, string> = {
  // tip rises at the very front to touch the upper teeth/ridge; the back stays low
  teeth: 'M133 123 Q150 126 162 109',
  // the back arches up to the soft palate near the throat; the tip stays low at the front
  palate: 'M163 123 Q150 126 134 108',
  // relaxed and flat along the whole floor of the mouth, not touching the roof anywhere
  flat: 'M133 121 Q150 127 163 121',
}

export default function MouthDiagram({
  tongue,
  lips,
  label,
  className = 'h-20 w-20',
}: {
  tongue: TonguePosition
  lips: LipShape
  label?: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={label}>
      {/* head silhouette */}
      <path d={HEAD_PATH} fill="#ffe3c2" stroke="#e3b78c" strokeWidth="2.5" />
      {/* eye, just enough to read as a face */}
      <circle cx="108" cy="62" r="4" fill="#3c2416" />

      {/* oral cavity cutaway */}
      <path d="M127 101 C150 93 168 98 170 110 L170 128 C168 139 150 144 127 136 C120 125 120 112 127 101 Z" fill="#ffeef2" stroke="#e8a6b8" strokeWidth="1.5" />

      {/* upper & lower teeth */}
      <rect x="156" y="104" width="13" height="6" rx="1.5" fill="#ffffff" stroke="#d8c9b8" strokeWidth="1" />
      <rect x="156" y="125" width="13" height="6" rx="1.5" fill="#ffffff" stroke="#d8c9b8" strokeWidth="1" />

      {/* tongue — the part that changes per sound */}
      <path d={TONGUE_PATHS[tongue]} fill="none" stroke="var(--color-brand-coral)" strokeWidth="11" strokeLinecap="round" />

      {/* lips, drawn over the cavity opening */}
      {lips === 'round' ? (
        <ellipse cx="184" cy="117" rx="10" ry="13" fill="none" stroke="#c6744f" strokeWidth="4" strokeLinecap="round" />
      ) : lips === 'smile' ? (
        <>
          {/* pulled flat against the teeth, with corner flicks suggesting the mouth is stretched wide */}
          <path d="M174 107 Q172 117 174 127" fill="none" stroke="#c6744f" strokeWidth="4" strokeLinecap="round" />
          <path d="M174 107 L184 101" fill="none" stroke="#c6744f" strokeWidth="3" strokeLinecap="round" />
          <path d="M174 127 L184 133" fill="none" stroke="#c6744f" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <path d="M172 105 Q179 117 172 129" fill="none" stroke="#c6744f" strokeWidth="4" strokeLinecap="round" />
      )}
    </svg>
  )
}
