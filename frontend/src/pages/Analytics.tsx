import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import { Layout, LoadingSpinner } from '../components'
import { analyticsAPI } from '../api'

export const Analytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [qualityData, setQualityData] = useState<any[]>([])
  const [devTimeData, setDevTimeData] = useState<any[]>([])
  const [originData, setOriginData] = useState<any[]>([])
  const [profileData, setProfileData] = useState<any[]>([])
  const [successData, setSuccessData] = useState<any[]>([])
  const [rorData, setRoRData] = useState<any[]>([])
  const [anomalyData, setAnomalyData] = useState<any[]>([])
  const [aiInsights, setAIInsights] = useState<string>('')

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      const [
        quality,
        devTime,
        origin,
        profile,
        success,
        ror,
        anomaly,
        insights,
      ] = await Promise.all([
        analyticsAPI.getQualityTrends(period),
        analyticsAPI.getDevelopmentTimeVsQuality(),
        analyticsAPI.getOriginAnalysis(),
        analyticsAPI.getProfilePerformance(),
        analyticsAPI.getSuccessRateTrends(period),
        analyticsAPI.getRoRAnalysis(period),
        analyticsAPI.getAnomalyFrequency(period),
        analyticsAPI.getAIInsights(),
      ])

      setQualityData(quality)
      setDevTimeData(devTime)
      setOriginData(origin)
      setProfileData(profile)
      setSuccessData(success)
      setRoRData(ror)
      setAnomalyData(anomaly)
      setAIInsights(insights)
    } catch (err) {
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-amber-500">Analytics</h2>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  period === p
                    ? 'bg-amber-600 text-white'
                    : 'bg-espresso-800 text-espresso-300 hover:border-amber-500 border border-espresso-700'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">AI Insights</h3>
            <p className="text-espresso-200 leading-relaxed">{aiInsights}</p>
          </div>
        )}

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quality trends */}
          {qualityData.length > 0 && (
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">Quality Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" domain={[0, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #d2691e' }} />
                  <Line type="monotone" dataKey="score" stroke="#fbbf24" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Success rate */}
          {successData.length > 0 && (
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">Success Rate Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={successData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #d2691e' }} />
                  <Bar dataKey="successRate" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Dev Time vs Quality */}
          {devTimeData.length > 0 && (
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">Dev Time vs Quality</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
                  <XAxis type="number" dataKey="devTime" stroke="#666" />
                  <YAxis type="number" dataKey="quality" stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #d2691e' }} />
                  <Scatter name="Roasts" data={devTimeData} fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* RoR Analysis */}
          {rorData.length > 0 && (
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">Rate of Rise Patterns</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #d2691e' }} />
                  <Line type="monotone" dataKey="ror" stroke="#ef4444" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Anomaly frequency */}
          {anomalyData.length > 0 && (
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">Anomaly Frequency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={anomalyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
                  <XAxis dataKey="type" stroke="#666" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #d2691e' }} />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Origin and Profile Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top origins */}
          {originData.length > 0 && (
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">Top Coffee Origins</h3>
              <div className="space-y-3">
                {originData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-espresso-800 rounded">
                    <div>
                      <p className="font-semibold text-espresso-100">{item.origin}</p>
                      <p className="text-espresso-400 text-xs">{item.roastCount} roasts</p>
                    </div>
                    <p className="text-amber-500 font-semibold">⭐ {item.averageQuality.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best profiles */}
          {profileData.length > 0 && (
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">Best Performing Profiles</h3>
              <div className="space-y-3">
                {profileData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-espresso-800 rounded">
                    <div>
                      <p className="font-semibold text-espresso-100">{item.profileName}</p>
                      <p className="text-espresso-400 text-xs">{item.roastCount} uses</p>
                    </div>
                    <p className="text-amber-500 font-semibold">
                      {(item.successRate * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
