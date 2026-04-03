import { ApiError, apiRequest } from './client.js'

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export function fetchMyFiles(token) {
  return apiRequest('/api/my-files', {
    headers: authHeaders(token),
  })
}

export function deleteOwnedFile(token, fileId) {
  return apiRequest(`/api/file/${fileId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export function uploadOwnedFile(token, file, receiverId) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('receiverId', receiverId)

  return apiRequest('/api/upload', {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  })
}

function parseDownloadFilename(contentDisposition, fallbackFilename) {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/i)
  return match?.[1] || fallbackFilename
}

async function readErrorPayload(response) {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  return isJson
    ? response.json().catch(() => null)
    : response.text().catch(() => null)
}

export async function downloadSharedFile(token, shareLink, fallbackFilename = 'download') {
  const response = await fetch(shareLink, {
    headers: authHeaders(token),
  })

  if (!response.ok) {
    const payload = await readErrorPayload(response)
    throw new ApiError(
      payload?.message || payload?.error || `Request failed with status ${response.status}`,
      response.status,
      payload,
    )
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = parseDownloadFilename(
    response.headers.get('content-disposition'),
    fallbackFilename,
  )
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}
