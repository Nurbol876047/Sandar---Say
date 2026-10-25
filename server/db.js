import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// DATA_DIR lets a deploy point this at a mounted persistent disk (see render.yaml) —
// without it, data lives in server/data and is lost whenever the container's
// filesystem resets (e.g. every redeploy on a disk-less Render service).
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
mkdirSync(DATA_DIR, { recursive: true })
const DB_PATH = path.join(DATA_DIR, 'db.json')

const EMPTY = { users: [], sessions: [], children: [], progress: [] }

function load() {
  if (!existsSync(DB_PATH)) return structuredClone(EMPTY)
  try {
    return { ...structuredClone(EMPTY), ...JSON.parse(readFileSync(DB_PATH, 'utf8')) }
  } catch {
    return structuredClone(EMPTY)
  }
}

let state = load()
let writeChain = Promise.resolve()

function persist() {
  writeChain = writeChain.then(
    () =>
      new Promise((resolve) => {
        writeFileSync(DB_PATH, JSON.stringify(state, null, 2))
        resolve()
      }),
  )
  return writeChain
}

export const db = {
  // --- users ---
  findUserByEmail(email) {
    return state.users.find((u) => u.email === email.toLowerCase().trim()) ?? null
  },
  findUserById(id) {
    return state.users.find((u) => u.id === id) ?? null
  },
  createUser({ email, name, passwordHash, salt, role }) {
    const user = {
      id: randomUUID(),
      email: email.toLowerCase().trim(),
      name,
      passwordHash,
      salt,
      role,
      createdAt: new Date().toISOString(),
    }
    state.users.push(user)
    persist()
    return user
  },

  // --- sessions ---
  createSession(userId) {
    const token = randomUUID() + randomUUID()
    state.sessions.push({ token, userId, createdAt: new Date().toISOString() })
    persist()
    return token
  },
  findSession(token) {
    return state.sessions.find((s) => s.token === token) ?? null
  },
  deleteSession(token) {
    state.sessions = state.sessions.filter((s) => s.token !== token)
    persist()
  },

  // --- children ---
  listChildrenByParent(parentId) {
    return state.children.filter((c) => c.parentId === parentId)
  },
  listAllChildren() {
    return state.children
  },
  findChildById(id) {
    return state.children.find((c) => c.id === id) ?? null
  },
  createChild({ parentId, name }) {
    const child = { id: randomUUID(), parentId, name, createdAt: new Date().toISOString() }
    state.children.push(child)
    persist()
    return child
  },
  deleteChild(id) {
    state.children = state.children.filter((c) => c.id !== id)
    state.progress = state.progress.filter((p) => p.childId !== id)
    persist()
  },

  // --- progress ---
  listProgressByChild(childId) {
    return state.progress.filter((p) => p.childId === childId)
  },
  upsertProgress({ childId, exerciseId, correct, total }) {
    const ratio = total > 0 ? correct / total : 0
    const stars = ratio >= 0.99 ? 3 : ratio >= 0.6 ? 2 : 1
    const existing = state.progress.find((p) => p.childId === childId && p.exerciseId === exerciseId)
    const existingRatio = existing && existing.bestTotal > 0 ? existing.bestCorrect / existing.bestTotal : -1
    const keepNew = ratio >= existingRatio

    if (existing) {
      existing.completed = true
      existing.bestCorrect = keepNew ? correct : existing.bestCorrect
      existing.bestTotal = keepNew ? total : existing.bestTotal
      existing.attempts += 1
      existing.stars = Math.max(existing.stars, stars)
      existing.lastCompletedAt = new Date().toISOString()
      persist()
      return existing
    }

    const row = {
      id: randomUUID(),
      childId,
      exerciseId,
      completed: true,
      bestCorrect: correct,
      bestTotal: total,
      attempts: 1,
      stars,
      lastCompletedAt: new Date().toISOString(),
    }
    state.progress.push(row)
    persist()
    return row
  },
}
