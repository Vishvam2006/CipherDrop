import { apiRequest } from './client.js'

export function registerUser(credentials) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
}

export function loginUser(credentials) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
}
