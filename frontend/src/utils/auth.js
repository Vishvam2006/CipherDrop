function decodeBase64Url(value) {
  const normalized = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')

  return atob(normalized)
}

export function getUserIdFromToken(token) {
  if (!token) {
    return ''
  }

  const [, payload] = token.split('.')

  if (!payload) {
    return ''
  }

  try {
    const decoded = decodeBase64Url(payload)
    const encoded = Array.from(decoded)
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
    const parsed = JSON.parse(decodeURIComponent(encoded))

    return parsed?.id || parsed?._id || parsed?.userId || ''
  } catch {
    return ''
  }
}
