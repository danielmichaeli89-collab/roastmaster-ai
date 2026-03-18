import client from './client'
import { User, AuthToken, LoginRequest, RegisterRequest, AuthResponse } from '../types'

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await client.post('/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await client.post('/auth/register', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await client.post('/auth/logout')
  },

  refresh: async (refreshToken: string): Promise<AuthToken> => {
    const response = await client.post('/auth/refresh', { refreshToken })
    return response.data.token
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await client.get('/auth/me')
    return response.data
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await client.patch(`/auth/profile/${userId}`, data)
    return response.data
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await client.post('/auth/change-password', { oldPassword, newPassword })
  },
}
