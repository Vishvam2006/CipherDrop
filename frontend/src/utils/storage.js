const TOKEN_STORAGE_KEY = 'cipherdrop.token'
const EMAIL_STORAGE_KEY = 'cipherdrop.email'
const SHARE_LINKS_STORAGE_KEY = 'cipherdrop.recentLinks'

function safeParse(rawValue, fallback) {
  try {
    return rawValue ? JSON.parse(rawValue) : fallback
  } catch {
    return fallback
  }
}

function getLocalStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.sessionStorage
}

function pruneExpiredLinks(record) {
  const now = Date.now()
  const nextEntries = Object.entries(record || {}).filter(([, value]) => {
    if (!value?.expiresAt) {
      return false
    }

    const expiresAtTime = new Date(value.expiresAt).getTime()
    return Number.isFinite(expiresAtTime) && expiresAtTime > now
  })

  return Object.fromEntries(nextEntries)
}

export function getStoredToken() {
  return getLocalStorage()?.getItem(TOKEN_STORAGE_KEY) || ''
}

export function persistToken(token) {
  getLocalStorage()?.setItem(TOKEN_STORAGE_KEY, token)
}

export function getStoredEmail() {
  return getLocalStorage()?.getItem(EMAIL_STORAGE_KEY) || ''
}

export function persistEmail(email) {
  getLocalStorage()?.setItem(EMAIL_STORAGE_KEY, email)
}

export function getStoredRecentLinks() {
  const storage = getSessionStorage()
  const parsed = safeParse(storage?.getItem(SHARE_LINKS_STORAGE_KEY), {})
  const pruned = pruneExpiredLinks(parsed)

  storage?.setItem(SHARE_LINKS_STORAGE_KEY, JSON.stringify(pruned))
  return pruned
}

export function persistRecentLinks(links) {
  getSessionStorage()?.setItem(SHARE_LINKS_STORAGE_KEY, JSON.stringify(links))
}

export function clearStoredSession() {
  getLocalStorage()?.removeItem(TOKEN_STORAGE_KEY)
  getSessionStorage()?.removeItem(SHARE_LINKS_STORAGE_KEY)
}

export function removeStoredRecentLink(fileId) {
  const nextLinks = { ...getStoredRecentLinks() }
  delete nextLinks[fileId]
  persistRecentLinks(nextLinks)
  return nextLinks
}
