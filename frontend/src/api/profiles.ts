import client from './client'
import { RoastProfile, ProfilePhase, PaginatedResponse } from '../types'

export const profilesAPI = {
  // Profile CRUD operations
  list: async (page = 1, limit = 20): Promise<PaginatedResponse<RoastProfile>> => {
    const response = await client.get('/profiles', {
      params: { page, limit },
    })
    return response.data
  },

  get: async (profileId: string): Promise<RoastProfile> => {
    const response = await client.get(`/profiles/${profileId}`)
    return response.data
  },

  create: async (data: Partial<RoastProfile>): Promise<RoastProfile> => {
    const response = await client.post('/profiles', data)
    return response.data
  },

  update: async (profileId: string, data: Partial<RoastProfile>): Promise<RoastProfile> => {
    const response = await client.patch(`/profiles/${profileId}`, data)
    return response.data
  },

  delete: async (profileId: string): Promise<void> => {
    await client.delete(`/profiles/${profileId}`)
  },

  // Duplicate profile
  duplicate: async (profileId: string, newName: string): Promise<RoastProfile> => {
    const response = await client.post(`/profiles/${profileId}/duplicate`, { newName })
    return response.data
  },

  // Phases
  getPhases: async (profileId: string): Promise<ProfilePhase[]> => {
    const response = await client.get(`/profiles/${profileId}/phases`)
    return response.data
  },

  createPhase: async (profileId: string, data: Partial<ProfilePhase>): Promise<ProfilePhase> => {
    const response = await client.post(`/profiles/${profileId}/phases`, data)
    return response.data
  },

  updatePhase: async (profileId: string, phaseId: string, data: Partial<ProfilePhase>): Promise<ProfilePhase> => {
    const response = await client.patch(`/profiles/${profileId}/phases/${phaseId}`, data)
    return response.data
  },

  deletePhase: async (profileId: string, phaseId: string): Promise<void> => {
    await client.delete(`/profiles/${profileId}/phases/${phaseId}`)
  },

  // Templates
  listTemplates: async (): Promise<RoastProfile[]> => {
    const response = await client.get('/profiles/templates')
    return response.data
  },

  // Import/Export
  exportProfile: async (profileId: string): Promise<Blob> => {
    const response = await client.get(`/profiles/${profileId}/export`, {
      responseType: 'blob',
    })
    return response.data
  },

  importProfile: async (file: File): Promise<RoastProfile> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await client.post('/profiles/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
