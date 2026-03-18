import { create } from 'zustand'
import { User } from '../types'

interface AuthStoreState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: true,
    })
  },

  setToken: (token) => {
    set({ token })
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },
}))
