import { apiRequest } from './client.js'

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

export function uploadOwnedFile(token, file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest('/api/upload', {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  })
}
