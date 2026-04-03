import { apiRequest } from './client.js'

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export function fetchFriends(token) {
  return apiRequest('/api/friends', {
    headers: authHeaders(token),
  })
}

export function fetchFriendRequests(token) {
  return apiRequest('/api/friends/requests', {
    headers: authHeaders(token),
  })
}

export function fetchActiveFriends(token) {
  return apiRequest('/api/friends/active', {
    headers: authHeaders(token),
  })
}

export function sendFriendRequest(token, email) {
  return apiRequest('/api/friends/post', {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
}

export function acceptFriendRequest(token, requestId) {
  return apiRequest(`/api/friends/accept/${requestId}`, {
    method: 'POST',
    headers: authHeaders(token),
  })
}
