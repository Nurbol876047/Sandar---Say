const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export interface ApiUser {
  id: string
  email: string
  name: string
  role: 'parent' | 'therapist'
}

export interface ApiChild {
  id: string
  parentId: string
  name: string
  createdAt: string
  parentEmail?: string
  parentName?: string
}

export interface ApiProgress {
  id: string
  childId: string
  exerciseId: string
  completed: boolean
  bestCorrect: number
  bestTotal: number
  attempts: number
  stars: number
  lastCompletedAt: string | null
}

export interface TherapistOverviewRow {
  child: ApiChild
  parentEmail: string | null
  parentName: string | null
  progress: ApiProgress[]
}

class ApiError extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Render's free instance type sleeps after ~15 min idle; the first request wakes it
// and can take 30-50s or briefly fail with a network error / 502-504 while it boots.
// Retry through that instead of surfacing it as "the site is broken" — but don't
// retry 4xx responses (wrong password etc.), those are real and immediate.
const WAKE_RETRY_DELAYS_MS = [1000, 3000, 6000, 10000, 15000]

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) }
  if (token) headers.Authorization = `Bearer ${token}`

  let lastNetworkError: unknown
  for (let attempt = 0; attempt <= WAKE_RETRY_DELAYS_MS.length; attempt++) {
    let res: Response
    try {
      res = await fetch(`${API_URL}${path}`, { ...options, headers })
    } catch (err) {
      lastNetworkError = err
      if (attempt < WAKE_RETRY_DELAYS_MS.length) {
        await sleep(WAKE_RETRY_DELAYS_MS[attempt])
        continue
      }
      throw new ApiError('Сервер ұйықтап жатыр, сәл кейінірек қайталап көріңіз')
    }

    if (!res.ok && [502, 503, 504].includes(res.status) && attempt < WAKE_RETRY_DELAYS_MS.length) {
      await sleep(WAKE_RETRY_DELAYS_MS[attempt])
      continue
    }

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new ApiError(data.error || 'Белгісіз қате')
    return data as T
  }

  throw new ApiError(lastNetworkError instanceof Error ? lastNetworkError.message : 'Белгісіз қате')
}

export const api = {
  register: (body: { email: string; password: string; name?: string; childName?: string; inviteCode?: string }) =>
    request<{ token: string; user: ApiUser; children: ApiChild[] }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: ApiUser; children: ApiChild[] }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: (token: string) => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }, token),
  me: (token: string) => request<{ user: ApiUser; children: ApiChild[] }>('/api/me', {}, token),
  listChildren: (token: string) => request<{ children: ApiChild[] }>('/api/children', {}, token),
  createChild: (token: string, name: string) =>
    request<{ child: ApiChild }>('/api/children', { method: 'POST', body: JSON.stringify({ name }) }, token),
  getProgress: (token: string, childId: string) => request<{ progress: ApiProgress[] }>(`/api/progress?childId=${childId}`, {}, token),
  postProgress: (token: string, body: { childId: string; exerciseId: string; correct: number; total: number }) =>
    request<{ progress: ApiProgress }>('/api/progress', { method: 'POST', body: JSON.stringify(body) }, token),
  therapistOverview: (token: string) => request<{ overview: TherapistOverviewRow[] }>('/api/therapist/overview', {}, token),
  exportCsvUrl: () => `${API_URL}/api/therapist/export.csv`,
}

export { ApiError }
