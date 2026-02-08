import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { setAuthToken } from '../api/client'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loginWithGoogle = async (credential) => {
    const response = await api.post('/auth/google', { credential })
    const { token, user: profile } = response.data
    localStorage.setItem('auth_token', token)
    setAuthToken(token)
    setUser(profile)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setAuthToken(null)
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setLoading(false)
      return
    }

    setAuthToken(token)
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data)
      })
      .catch(() => {
        localStorage.removeItem('auth_token')
        setAuthToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({ user, loading, loginWithGoogle, logout }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
