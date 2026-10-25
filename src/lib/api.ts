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

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || 'Белгісіз қате')
  return data as T
}

export const api = {
  register: (body: { email: string; password: string; name?: string; childName?: string }) =>
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
