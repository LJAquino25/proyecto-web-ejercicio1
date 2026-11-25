const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api'

export function getAuthToken() {
  return localStorage.getItem('token')
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const error = new Error(data?.message || `Error HTTP ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}