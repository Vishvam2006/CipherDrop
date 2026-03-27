const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function getErrorMessage(payload, fallback) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    return payload.message || payload.error || fallback
  }

  return fallback
}

export function getApiBaseUrl() {
  return API_BASE_URL
}

export function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(buildApiUrl(path), options)
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, `Request failed with status ${response.status}`),
      response.status,
      payload,
    )
  }

  return payload
}
