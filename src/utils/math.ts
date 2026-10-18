export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function isEven(n: number): boolean {
  return n % 2 === 0
}

/** Generate N distinct wrong-answer choices near a target value, plus the target, shuffled. */
export function buildChoices(target: number, count: number, min: number, max: number): number[] {
  const choices = new Set<number>([target])
  let guard = 0
  while (choices.size < count && guard < 200) {
    guard++
    const offset = randomInt(-3, 3)
    const candidate = target + offset
    if (candidate >= min && candidate <= max && candidate !== target) {
      choices.add(candidate)
    }
  }
  // fallback fill if range too small
  let filler = min
  while (choices.size < count && filler <= max) {
    choices.add(filler)
    filler++
  }
  return shuffle(Array.from(choices))
}

export interface MathProblem {
  a: number
  b: number
  op: '+' | '-'
  answer: number
}

export function generateMathProblem(level: 'easy' | 'medium'): MathProblem {
  const maxA = level === 'easy' ? 5 : 9
  const isAdd = Math.random() > 0.45
  if (isAdd) {
    const a = randomInt(1, maxA - 1)
    const maxB = Math.min(maxA - a, level === 'easy' ? 5 : 9)
    const b = randomInt(1, Math.max(1, maxB))
    return { a, b, op: '+', answer: a + b }
  }
  const a = randomInt(2, maxA)
  const b = randomInt(1, a - 1 >= 1 ? a - 1 : 1)
  return { a, b, op: '-', answer: a - b }
}

export interface CompositionPair {
  left: number
  right: number
}

export function randomComposition(total: number): CompositionPair {
  const left = randomInt(1, total - 1)
  return { left, right: total - left }
}
