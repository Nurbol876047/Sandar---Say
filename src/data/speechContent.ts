import type { TranslationKey } from './translations'

export interface FollowMove {
  id: string
  emoji: string
  nameKey: TranslationKey
  descKey: TranslationKey
  seconds: number
  video?: string
}

export const ARTICULATION_MOVES: FollowMove[] = [
  { id: 'clock', emoji: '🕐', nameKey: 'move.clock.name', descKey: 'move.clock.desc', seconds: 8, video: '/videos/articulation/clock.mp4' },
  { id: 'horse', emoji: '🐴', nameKey: 'move.horse.name', descKey: 'move.horse.desc', seconds: 8, video: '/videos/articulation/horse.mp4' },
  { id: 'jam', emoji: '🍯', nameKey: 'move.jam.name', descKey: 'move.jam.desc', seconds: 8, video: '/videos/articulation/jam.mp4' },
  { id: 'mushroom', emoji: '🍄', nameKey: 'move.mushroom.name', descKey: 'move.mushroom.desc', seconds: 8, video: '/videos/articulation/mushroom.mp4' },
]

export const SOUND_LU_MOVES: FollowMove[] = [
  { id: 'steamship', emoji: '🚢', nameKey: 'move.steamship.name', descKey: 'move.steamship.desc', seconds: 8 },
  { id: 'wolfhowl', emoji: '🐺', nameKey: 'move.wolfhowl.name', descKey: 'move.wolfhowl.desc', seconds: 8 },
]

export const BREATHING_MOVES: FollowMove[] = [
  { id: 'bubbles', emoji: '🫧', nameKey: 'move.bubbles.name', descKey: 'move.bubbles.desc', seconds: 8, video: '/videos/breathing/bubbles.mp4' },
  { id: 'candle', emoji: '🕯️', nameKey: 'move.candle.name', descKey: 'move.candle.desc', seconds: 8, video: '/videos/breathing/candle.mp4' },
  { id: 'balloon', emoji: '🎈', nameKey: 'move.balloon.name', descKey: 'move.balloon.desc', seconds: 8, video: '/videos/breathing/balloon.mp4' },
]

export const NEUROGYM_MOVES: FollowMove[] = [
  { id: 'crosscrawl', emoji: '🚶', nameKey: 'move.crosscrawl.name', descKey: 'move.crosscrawl.desc', seconds: 10, video: '/videos/neurogym/crosscrawl.mp4' },
  { id: 'earnose', emoji: '👃', nameKey: 'move.earnose.name', descKey: 'move.earnose.desc', seconds: 10, video: '/videos/neurogym/earnose.mp4' },
  { id: 'butterfly', emoji: '🦋', nameKey: 'move.butterfly.name', descKey: 'move.butterfly.desc', seconds: 10, video: '/videos/neurogym/butterfly.mp4' },
  { id: 'infinity8', emoji: '♾️', nameKey: 'move.infinity8.name', descKey: 'move.infinity8.desc', seconds: 10, video: '/videos/neurogym/infinity8.mp4' },
]

export type SoundOption = 'A' | 'B'

export interface SoundWord {
  text: string
  emoji: string
  correct: SoundOption
}

export interface SoundPair {
  id: string
  labelA: string
  labelB: string
  titleKey: TranslationKey
  descKey: TranslationKey
  /** Short mnemonic from a speech therapist that explains how to tell the two sounds apart, shown during the exercise. */
  hintKey?: TranslationKey
  words: SoundWord[]
}

export const SOUND_PAIRS: Record<'rl' | 'sh' | 'nn', SoundPair> = {
  rl: {
    id: 'rl',
    labelA: 'Р',
    labelB: 'Л',
    titleKey: 'ex.soundRl.title',
    descKey: 'ex.soundRl.desc',
    words: [
      { text: 'қарбыз', emoji: '🍉', correct: 'A' },
      { text: 'алма', emoji: '🍎', correct: 'B' },
      { text: 'орындық', emoji: '🪑', correct: 'A' },
      { text: 'жылан', emoji: '🐍', correct: 'B' },
      { text: 'арыстан', emoji: '🦁', correct: 'A' },
      { text: 'балық', emoji: '🐟', correct: 'B' },
      { text: 'торғай', emoji: '🐦', correct: 'A' },
      { text: 'гүл', emoji: '🌸', correct: 'B' },
    ],
  },
  sh: {
    id: 'sh',
    labelA: 'С',
    labelB: 'Ш',
    titleKey: 'ex.soundSh.title',
    descKey: 'ex.soundSh.desc',
    hintKey: 'soundsort.hint.sh',
    words: [
      { text: 'су', emoji: '💧', correct: 'A' },
      { text: 'шана', emoji: '🛷', correct: 'B' },
      { text: 'құс', emoji: '🐤', correct: 'A' },
      { text: 'шар', emoji: '🎈', correct: 'B' },
      { text: 'сағат', emoji: '⏰', correct: 'A' },
      { text: 'ағаш', emoji: '🌳', correct: 'B' },
      { text: 'сиыр', emoji: '🐄', correct: 'A' },
      { text: 'шөп', emoji: '🌿', correct: 'B' },
    ],
  },
  nn: {
    id: 'nn',
    labelA: 'Н',
    labelB: 'Ң',
    titleKey: 'ex.soundNn.title',
    descKey: 'ex.soundNn.desc',
    hintKey: 'soundsort.hint.nn',
    words: [
      { text: 'нан', emoji: '🍞', correct: 'A' },
      { text: 'таң', emoji: '🌅', correct: 'B' },
      { text: 'ана', emoji: '👩', correct: 'A' },
      { text: 'мың', emoji: '🔢', correct: 'B' },
      { text: 'күн', emoji: '☀️', correct: 'A' },
      { text: 'аң', emoji: '🦌', correct: 'B' },
      { text: 'ән', emoji: '🎵', correct: 'A' },
      { text: 'қоңырау', emoji: '🔔', correct: 'B' },
    ],
  },
}

export interface RootWordGroup {
  root: string
  words: string[]
}

/**
 * The 4-root method for teaching Ң to older children: each root keeps its Ң across every
 * derived word in its family, so recognising the shared root is how a child learns to spell
 * it correctly instead of guessing Н vs Ң by ear. Content taken verbatim from the speech
 * therapist's reference table (root -> its derived words).
 */
export const NN_ROOT_GROUPS: RootWordGroup[] = [
  { root: 'ЖЕҢ', words: ['ЖЕҢІЛ', 'ЖЕҢГЕ', 'ЖЕҢІМПАЗ'] },
  { root: 'ТАҢ', words: ['ТАҢҒЫ', 'ТАҢДАУ', 'ТАҢБА'] },
  { root: 'ТЫҢ', words: ['ТЫҢШЫ', 'ТЫҢДАЛЫМ', 'ТЫҢДА'] },
  { root: 'ЖАҢ', words: ['ЖАҢА', 'ЖАҢҒАҚ', 'ЖАҢАЛЫҚ'] },
]
