import client from './client'
import { RoastStats, OriginAnalysis, ProfilePerformance, RoastFilter } from '../types'

export const analyticsAPI = {
  // Overall statistics
  getStats: async (filters?: RoastFilter): Promise<RoastStats> => {
    const response = await client.get('/analytics/stats', {
      params: filters,
    })
    return response.data
  },

  // Quality trends over time
  getQualityTrends: async (period: 'week' | 'month' | 'year' = 'month'): Promise<any[]> => {
    const response = await client.get('/analytics/quality-trends', {
      params: { period },
    })
    return response.data
  },

  // Development time vs quality score
  getDevelopmentTimeVsQuality: async (): Promise<any[]> => {
    const response = await client.get('/analytics/dev-time-vs-quality')
    return response.data
  },

  // Rate of Rise (RoR) analysis
  getRoRAnalysis: async (period: 'week' | 'month' | 'year' = 'month'): Promise<any[]> => {
    const response = await client.get('/analytics/ror-analysis', {
      params: { period },
    })
    return response.data
  },

  // Origin analysis
  getOriginAnalysis: async (): Promise<OriginAnalysis[]> => {
    const response = await client.get('/analytics/origin-analysis')
    return response.data
  },

  // Profile performance
  getProfilePerformance: async (): Promise<ProfilePerformance[]> => {
    const response = await client.get('/analytics/profile-performance')
    return response.data
  },

  // Roast level distribution
  getRoastLevelDistribution: async (): Promise<any[]> => {
    const response = await client.get('/analytics/roast-level-distribution')
    return response.data
  },

  // Success rate over time
  getSuccessRateTrends: async (period: 'week' | 'month' | 'year' = 'month'): Promise<any[]> => {
    const response = await client.get('/analytics/success-rate-trends', {
      params: { period },
    })
    return response.data
  },

  // AI insights
  getAIInsights: async (): Promise<string> => {
    const response = await client.get('/analytics/ai-insights')
    return response.data.insights
  },

  // Anomaly frequency
  getAnomalyFrequency: async (period: 'week' | 'month' | 'year' = 'month'): Promise<any[]> => {
    const response = await client.get('/analytics/anomaly-frequency', {
      params: { period },
    })
    return response.data
  },

  // Export data
  exportAnalytics: async (format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    const response = await client.get('/analytics/export', {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  },
}
