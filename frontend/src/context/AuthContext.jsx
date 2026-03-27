import { useCallback, useState } from 'react'
import { AuthContext } from './auth-context.js'
import { loginUser, registerUser } from '../services/api/auth.js'
import {
  clearStoredSession,
  getStoredEmail,
  getStoredToken,
  persistEmail,
  persistToken,
} from '../utils/storage.js'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [email, setEmail] = useState(() => getStoredEmail())

  const login = useCallback(async (credentials) => {
    const response = await loginUser(credentials)

    persistToken(response.token)
    persistEmail(credentials.email)
    setToken(response.token)
    setEmail(credentials.email)

    return response
  }, [])

  const register = useCallback(async (credentials) => {
    const response = await registerUser(credentials)
    persistEmail(credentials.email)
    setEmail(credentials.email)
    return response
  }, [])

  const logout = useCallback(() => {
    clearStoredSession()
    setToken('')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        isAuthenticated: Boolean(token),
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
