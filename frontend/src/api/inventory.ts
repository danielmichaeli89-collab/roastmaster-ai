import client from './client'
import { GreenCoffee, CuppingNotes, PaginatedResponse } from '../types'

export const inventoryAPI = {
  // Green coffee CRUD
  list: async (page = 1, limit = 20): Promise<PaginatedResponse<GreenCoffee>> => {
    const response = await client.get('/inventory', {
      params: { page, limit },
    })
    return response.data
  },

  get: async (coffeeId: string): Promise<GreenCoffee> => {
    const response = await client.get(`/inventory/${coffeeId}`)
    return response.data
  },

  create: async (data: Partial<GreenCoffee>): Promise<GreenCoffee> => {
    const response = await client.post('/inventory', data)
    return response.data
  },

  update: async (coffeeId: string, data: Partial<GreenCoffee>): Promise<GreenCoffee> => {
    const response = await client.put(`/inventory/${coffeeId}`, data)
    return response.data
  },

  delete: async (coffeeId: string): Promise<void> => {
    await client.delete(`/inventory/${coffeeId}`)
  },

  // Get roast history for a coffee
  getRoastHistory: async (coffeeId: string): Promise<any[]> => {
    const response = await client.get(`/inventory/${coffeeId}/roast-history`)
    return response.data
  },

  // Cupping notes
  addCuppingNotes: async (coffeeId: string, data: Partial<CuppingNotes>): Promise<CuppingNotes> => {
    const response = await client.post(`/inventory/${coffeeId}/cupping-notes`, data)
    return response.data
  },

  getCuppingNotes: async (coffeeId: string): Promise<CuppingNotes[]> => {
    const response = await client.get(`/inventory/${coffeeId}/cupping-notes`)
    return response.data
  },

  updateCuppingNotes: async (coffeeId: string, cuppingId: string, data: Partial<CuppingNotes>): Promise<CuppingNotes> => {
    const response = await client.patch(`/inventory/${coffeeId}/cupping-notes/${cuppingId}`, data)
    return response.data
  },

  deleteCuppingNotes: async (coffeeId: string, cuppingId: string): Promise<void> => {
    await client.delete(`/inventory/${coffeeId}/cupping-notes/${cuppingId}`)
  },

  // Search and filter
  search: async (query: string): Promise<GreenCoffee[]> => {
    const response = await client.get('/inventory/search', {
      params: { q: query },
    })
    return response.data
  },

  searchByOrigin: async (origin: string): Promise<GreenCoffee[]> => {
    const response = await client.get('/inventory/search/origin', {
      params: { origin },
    })
    return response.data
  },
}
