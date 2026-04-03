import { io } from 'socket.io-client'
import { getApiBaseUrl } from './api/client.js'

export function getSocketBaseUrl() {
  const apiBaseUrl = getApiBaseUrl()

  if (apiBaseUrl) {
    return apiBaseUrl.replace(/\/api\/?$/, '')
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:5000'
  }

  const { protocol, hostname, origin } = window.location

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:5000`
  }

  return origin
}

export function createAppSocket() {
  return io(getSocketBaseUrl(), {
    transports: ['websocket', 'polling'],
  })
}
