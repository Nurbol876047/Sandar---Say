import express from 'express'
import cors from 'cors'
import { db } from './db.js'
import { hashPassword, verifyPassword } from './auth.js'

const PORT = process.env.PORT || 8787
// Whoever registers with this code (as the "I'm a therapist" option on the signup
// form) gets the therapist role, which can see every parent's children — so this
// must be set to a real secret in production (Render dashboard env var), shared
// only with the actual logoped(s). Unset = therapist self-registration is disabled.
const THERAPIST_INVITE_CODE = process.env.THERAPIST_INVITE_CODE || null

const app = express()
app.use(cors())
app.use(express.json())

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Кіру қажет' })
  const session = db.findSession(token)
  if (!session) return res.status(401).json({ error: 'Сессия аяқталды, қайта кіріңіз' })
  const user = db.findUserById(session.userId)
  if (!user) return res.status(401).json({ error: 'Пайдаланушы табылмады' })
  req.user = user
  req.token = token
  next()
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ error: 'Рұқсат жоқ' })
    next()
  }
}

function childBelongsToParent(childId, parentId) {
  const child = db.findChildById(childId)
  return child && child.parentId === parentId ? child : null
}

// --- auth ---

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, childName, inviteCode } = req.body ?? {}
  if (!email || !password || String(password).length < 6) {
    return res.status(400).json({ error: 'Email және кемінде 6 таңбалы құпиясөз қажет' })
  }
  if (db.findUserByEmail(email)) {
    return res.status(409).json({ error: 'Бұл email тіркелген' })
  }

  let role = 'parent'
  if (inviteCode) {
    if (!THERAPIST_INVITE_CODE || inviteCode !== THERAPIST_INVITE_CODE) {
      return res.status(403).json({ error: 'Логопед коды қате' })
    }
    role = 'therapist'
  }

  const { salt, passwordHash } = hashPassword(password)
  const user = db.createUser({ email, name: name || '', passwordHash, salt, role })
  const token = db.createSession(user.id)
  let child = null
  if (role === 'parent' && childName && String(childName).trim()) {
    child = db.createChild({ parentId: user.id, name: String(childName).trim() })
  }
  res.json({ token, user: publicUser(user), children: child ? [child] : [] })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  const user = email ? db.findUserByEmail(email) : null
  if (!user || !verifyPassword(password ?? '', user.salt, user.passwordHash)) {
    return res.status(401).json({ error: 'Email немесе құпиясөз қате' })
  }
  const token = db.createSession(user.id)
  const children = user.role === 'parent' ? db.listChildrenByParent(user.id) : []
  res.json({ token, user: publicUser(user), children })
})

app.post('/api/auth/logout', requireAuth, (req, res) => {
  db.deleteSession(req.token)
  res.json({ ok: true })
})

app.get('/api/me', requireAuth, (req, res) => {
  const children = req.user.role === 'parent' ? db.listChildrenByParent(req.user.id) : []
  res.json({ user: publicUser(req.user), children })
})

// --- children ---

app.get('/api/children', requireAuth, (req, res) => {
  if (req.user.role === 'therapist') {
    const children = db.listAllChildren().map((c) => {
      const parent = db.findUserById(c.parentId)
      return { ...c, parentEmail: parent?.email ?? null, parentName: parent?.name ?? null }
    })
    return res.json({ children })
  }
  res.json({ children: db.listChildrenByParent(req.user.id) })
})

app.post('/api/children', requireAuth, requireRole('parent'), (req, res) => {
  const { name } = req.body ?? {}
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Баланың атын енгізіңіз' })
  const child = db.createChild({ parentId: req.user.id, name: String(name).trim() })
  res.json({ child })
})

app.delete('/api/children/:id', requireAuth, requireRole('parent'), (req, res) => {
  if (!childBelongsToParent(req.params.id, req.user.id)) return res.status(404).json({ error: 'Бала табылмады' })
  db.deleteChild(req.params.id)
  res.json({ ok: true })
})

// --- progress ---

app.get('/api/progress', requireAuth, (req, res) => {
  const { childId } = req.query
  if (!childId) return res.status(400).json({ error: 'childId қажет' })
  const child = db.findChildById(childId)
  if (!child) return res.status(404).json({ error: 'Бала табылмады' })
  if (req.user.role === 'parent' && child.parentId !== req.user.id) return res.status(403).json({ error: 'Рұқсат жоқ' })
  res.json({ progress: db.listProgressByChild(childId) })
})

app.post('/api/progress', requireAuth, requireRole('parent'), (req, res) => {
  const { childId, exerciseId, correct, total } = req.body ?? {}
  if (!childBelongsToParent(childId, req.user.id)) return res.status(404).json({ error: 'Бала табылмады' })
  if (!exerciseId || typeof correct !== 'number' || typeof total !== 'number') {
    return res.status(400).json({ error: 'Деректер толық емес' })
  }
  const row = db.upsertProgress({ childId, exerciseId, correct, total })
  res.json({ progress: row })
})

// --- therapist dashboard ---

app.get('/api/therapist/overview', requireAuth, requireRole('therapist'), (req, res) => {
  const overview = db.listAllChildren().map((child) => {
    const parent = db.findUserById(child.parentId)
    return {
      child,
      parentEmail: parent?.email ?? null,
      parentName: parent?.name ?? null,
      progress: db.listProgressByChild(child.id),
    }
  })
  res.json({ overview })
})

const EXERCISE_TITLES_KK = {
  counting: 'Лақтыр да, сана!',
  'odd-even': 'Жұп па, тақ па?',
  math: 'Есепте де, лақтыр!',
  fingers: 'Саусақтар сөйлейді',
  composition: 'Санның құрамын көрсет',
  infinity: 'Сиқырлы сегіздік',
  articulation: 'Артикуляциялық гимнастика',
  neurogym: 'Нейрогимнастика',
  'sound-rl': 'Р мен Л дыбыстарын ажырату',
  'sound-sh': 'С пен Ш дыбыстарын ажырату',
  'sound-nn': 'Н мен Ң дыбыстарын ажырату',
}

function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

app.get('/api/therapist/export.csv', requireAuth, requireRole('therapist'), (req, res) => {
  const header = ['Бала', 'Ата-ана', 'Email', 'Жаттығу', 'Аяқталды', 'Әрекет саны', 'Үздік нәтиже', 'Жұлдыз', 'Соңғы күні']
  const rows = [header]

  for (const child of db.listAllChildren()) {
    const parent = db.findUserById(child.parentId)
    const progress = db.listProgressByChild(child.id)
    for (const p of progress) {
      rows.push([
        child.name,
        parent?.name ?? '',
        parent?.email ?? '',
        EXERCISE_TITLES_KK[p.exerciseId] ?? p.exerciseId,
        p.completed ? 'Иә' : 'Жоқ',
        p.attempts,
        `${p.bestCorrect}/${p.bestTotal}`,
        p.stars,
        p.lastCompletedAt ?? '',
      ])
    }
  }

  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\r\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="sandar-soyleydi-progress-${new Date().toISOString().slice(0, 10)}.csv"`)
  res.send('﻿' + csv) // BOM so Excel renders Cyrillic correctly
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`[sandar-soyleydi-server] listening on http://localhost:${PORT}`)
})
