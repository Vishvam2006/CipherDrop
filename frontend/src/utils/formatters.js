export function formatBytes(size) {
  if (!Number.isFinite(size) || size <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const digits = value >= 10 || unitIndex === 0 ? 0 : 1
  return `${value.toFixed(digits)} ${units[unitIndex]}`
}

export function formatDateTime(value) {
  if (!value) {
    return 'Unknown'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getExpiryMeta(expiresAt, now = Date.now()) {
  if (!expiresAt) {
    return { label: 'No expiry data', tone: 'neutral', isExpired: false }
  }

  const expiresAtTime = new Date(expiresAt).getTime()

  if (Number.isNaN(expiresAtTime)) {
    return { label: 'Unknown expiry', tone: 'neutral', isExpired: false }
  }

  const diff = expiresAtTime - now

  if (diff <= 0) {
    return { label: 'Expired', tone: 'expired', isExpired: true }
  }

  const seconds = Math.ceil(diff / 1000)

  if (seconds < 60) {
    return {
      label: `Expires in ${seconds}s`,
      tone: seconds <= 15 ? 'warning' : 'live',
      isExpired: false,
    }
  }

  const minutes = Math.ceil(seconds / 60)
  return { label: `Expires in ${minutes}m`, tone: 'live', isExpired: false }
}

export function sortFilesByUploadDate(files) {
  return [...files].sort(
    (left, right) => new Date(right.uploadDate).getTime() - new Date(left.uploadDate).getTime(),
  )
}

export function getTotalStorage(files) {
  return files.reduce((total, file) => total + (Number(file.size) || 0), 0)
}
