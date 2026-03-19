import client from './client'
import { Roast, TemperatureLog, ControlLog, RoastAnomaly, RoastFilter, PaginatedResponse, RoastEvent } from '../types'

export const roastsAPI = {
  // Roast CRUD operations
  list: async (filter?: RoastFilter, page = 1, limit = 20): Promise<PaginatedResponse<Roast>> => {
    const response = await client.get('/roasts', {
      params: { ...filter, page, limit },
    })
    return response.data
  },

  get: async (roastId: string): Promise<Roast> => {
    const response = await client.get(`/roasts/${roastId}`)
    return response.data
  },

  create: async (data: Partial<Roast>): Promise<Roast> => {
    const response = await client.post('/roasts', data)
    return response.data
  },

  update: async (roastId: string, data: Partial<Roast>): Promise<Roast> => {
    const response = await client.put(`/roasts/${roastId}`, data)
    return response.data
  },

  delete: async (roastId: string): Promise<void> => {
    await client.delete(`/roasts/${roastId}`)
  },

  // Temperature logs
  getTemperatureLogs: async (roastId: string): Promise<TemperatureLog[]> => {
    const response = await client.get(`/roasts/${roastId}/temperature-logs`)
    return response.data
  },

  addTemperatureLog: async (roastId: string, data: Partial<TemperatureLog>): Promise<TemperatureLog> => {
    const response = await client.post(`/roasts/${roastId}/temperature-logs`, data)
    return response.data
  },

  // Control logs
  getControlLogs: async (roastId: string): Promise<ControlLog[]> => {
    const response = await client.get(`/roasts/${roastId}/control-logs`)
    return response.data
  },

  addControlLog: async (roastId: string, data: Partial<ControlLog>): Promise<ControlLog> => {
    const response = await client.post(`/roasts/${roastId}/control-logs`, data)
    return response.data
  },

  // Anomalies
  getAnomalies: async (roastId: string): Promise<RoastAnomaly[]> => {
    const response = await client.get(`/roasts/${roastId}/anomalies`)
    return response.data
  },

  addAnomaly: async (roastId: string, data: Partial<RoastAnomaly>): Promise<RoastAnomaly> => {
    const response = await client.post(`/roasts/${roastId}/anomalies`, data)
    return response.data
  },

  updateAnomaly: async (roastId: string, anomalyId: string, data: Partial<RoastAnomaly>): Promise<RoastAnomaly> => {
    const response = await client.put(`/roasts/${roastId}/anomalies/${anomalyId}`, data)
    return response.data
  },

  // Roast control commands
  startRoast: async (roastId: string): Promise<{ status: string }> => {
    const response = await client.post(`/roasts/${roastId}/start`)
    return response.data
  },

  stopRoast: async (roastId: string): Promise<{ status: string }> => {
    const response = await client.post(`/roasts/${roastId}/stop`)
    return response.data
  },

  emergencyStop: async (roastId: string): Promise<{ status: string }> => {
    const response = await client.post(`/roasts/${roastId}/emergency-stop`)
    return response.data
  },

  updateControls: async (roastId: string, controls: {
    power?: number
    airflow?: number
    fanRpm?: number
    motorRpm?: number
  }): Promise<ControlLog> => {
    const response = await client.post(`/roasts/${roastId}/controls`, controls)
    return response.data
  },

  // Roast events
  getRoastEvents: async (roastId: string): Promise<RoastEvent[]> => {
    const response = await client.get(`/roasts/${roastId}/events`)
    return response.data
  },

  addRoastEvent: async (roastId: string, data: Partial<RoastEvent>): Promise<RoastEvent> => {
    const response = await client.post(`/roasts/${roastId}/events`, data)
    return response.data
  },

  // Statistics
  getStats: async (filters?: RoastFilter) => {
    const response = await client.get('/roasts/stats', {
      params: filters,
    })
    return response.data
  },
}
