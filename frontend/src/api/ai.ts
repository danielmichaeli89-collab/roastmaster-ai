import client from './client'
import { AIAnalysisResult, AIRecommendation, RoastProfile } from '../types'

export const aiAPI = {
  // Generate roast profile from AI
  generateProfile: async (data: {
    greenCoffeeId?: string
    coffeeOrigin?: string
    targetFlavorProfile: string[]
    roastLevel: string
    processingMethod?: string
    densityScore?: number
  }): Promise<RoastProfile> => {
    const response = await client.post('/ai/generate-profile', data)
    return response.data
  },

  // Optimize existing profile
  optimizeProfile: async (profileId: string, roastHistoryIds?: string[]): Promise<RoastProfile> => {
    const response = await client.post(`/ai/optimize-profile/${profileId}`, {
      roastHistoryIds,
    })
    return response.data
  },

  // Get real-time monitoring recommendations
  getMonitoringRecommendations: async (roastId: string): Promise<AIRecommendation[]> => {
    const response = await client.get(`/ai/monitoring-recommendations/${roastId}`)
    return response.data
  },

  // Analyze completed roast
  analyzeRoast: async (roastId: string): Promise<AIAnalysisResult> => {
    const response = await client.post(`/ai/analyze-roast/${roastId}`)
    return response.data
  },

  // Get quality prediction
  predictQuality: async (roastId: string): Promise<{
    predictedQualityScore: number
    confidence: number
    reasoning: string
    suggestions: string[]
  }> => {
    const response = await client.get(`/ai/predict-quality/${roastId}`)
    return response.data
  },

  // Detect anomalies with AI
  detectAnomalies: async (roastId: string): Promise<any[]> => {
    const response = await client.post(`/ai/detect-anomalies/${roastId}`)
    return response.data
  },

  // Get optimization suggestions
  getOptimizationSuggestions: async (profileId: string): Promise<string[]> => {
    const response = await client.get(`/ai/optimization-suggestions/${profileId}`)
    return response.data
  },

  // Compare roasts with AI analysis
  compareRoasts: async (roastIds: string[]): Promise<{
    similarities: string[]
    differences: string[]
    insights: string[]
  }> => {
    const response = await client.post('/ai/compare-roasts', { roastIds })
    return response.data
  },

  // Get flavor wheel recommendations
  getFlavorWheelRecommendations: async (coffeeOrigin: string, roastLevel: string): Promise<string[]> => {
    const response = await client.get('/ai/flavor-wheel-recommendations', {
      params: { origin: coffeeOrigin, roastLevel },
    })
    return response.data
  },

  // Analyze cupping notes
  analyzeCuppingNotes: async (cuppingId: string): Promise<{
    insights: string[]
    suggestions: string[]
    comparison: string
  }> => {
    const response = await client.post(`/ai/analyze-cupping/${cuppingId}`)
    return response.data
  },
}
