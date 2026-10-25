import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return { salt, passwordHash: hash }
}

export function verifyPassword(password, salt, passwordHash) {
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(passwordHash, 'hex')
  if (candidate.length !== expected.length) return false
  return timingSafeEqual(candidate, expected)
}
