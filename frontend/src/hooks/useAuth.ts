import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/auth'
import { User, LoginRequest, RegisterRequest } from '../types'

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const store = useAuthStore()

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token && !store.user) {
        try {
          const user = await authAPI.getCurrentUser()
          store.setUser(user)
          store.setToken(token)
        } catch (err) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          store.logout()
        }
      }
    }

    initAuth()
  }, [store])

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await authAPI.login(credentials)
        store.setUser(response.user)
        store.setToken(response.token.accessToken)
        localStorage.setItem('accessToken', response.token.accessToken)
        localStorage.setItem('refreshToken', response.token.refreshToken)
        return response.user
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Login failed'
        setError(errorMsg)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [store]
  )

  const register = useCallback(
    async (data: RegisterRequest) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await authAPI.register(data)
        store.setUser(response.user)
        store.setToken(response.token.accessToken)
        localStorage.setItem('accessToken', response.token.accessToken)
        localStorage.setItem('refreshToken', response.token.refreshToken)
        return response.user
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Registration failed'
        setError(errorMsg)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [store]
  )

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      store.logout()
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }, [store])

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      setIsLoading(true)
      setError(null)

      try {
        if (!store.user) throw new Error('No user logged in')
        const updated = await authAPI.updateProfile(store.user.id, data)
        store.setUser(updated)
        return updated
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to update profile'
        setError(errorMsg)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [store]
  )

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      setIsLoading(true)
      setError(null)

      try {
        await authAPI.changePassword(oldPassword, newPassword)
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to change password'
        setError(errorMsg)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  }
}
