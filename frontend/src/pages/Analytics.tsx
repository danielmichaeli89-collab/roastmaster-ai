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
  const [rorData, setRoRData] = useState<any[]>([])
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
        ror,
        insights,
      ] = await Promise.all([
        analyticsAPI.getQualityTrends(period),
        analyticsAPI.getDevelopmentTimeVsQuality(),
        analyticsAPI.getOriginAnalysis(),
        analyticsAPI.getProfilePerformance(),
        analyticsAPI.getRoRAnalysis(period),
        analyticsAPI.getAIInsights(),
      ])

      setQualityData(quality)
      setDevTimeData(devTime)
      setOriginData(origin)
      setProfileData(profile)
      setRoRData(ror)
      setAIInsights(insights as string)
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
          <div>
            <h2 className="text-3xl font-bold text-accent-amber">AI INSIGHTS</h2>
            <p className="text-text-secondary mt-1">Advanced roasting analytics and trends</p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  period === p
                    ? 'bg-accent-amber text-primary'
                    : 'bg-elevated text-text-secondary hover:border-accent-amber border border-elevated'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* AI Insights Banner */}
        {aiInsights && (
          <div className="bg-gradient-to-r from-accent-amber/20 to-accent-gold/20 border border-accent-amber/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-accent-amber mb-3">Generated Summary</h3>
            <p className="text-text-primary leading-relaxed">{aiInsights}</p>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quality Trends */}
          {qualityData.length > 0 && (
            <div className="bg-card rounded-xl border border-elevated p-6">
              <h3 className="text-lg font-bold text-accent-amber mb-4">Quality Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
                  <XAxis dataKey="date" stroke="#737373" />
                  <YAxis stroke="#737373" domain={[0, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #f59e0b' }} />
                  <Line type="monotone" dataKey="score" stroke="#fbbf24" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Development Ratio Distribution */}
          {devTimeData.length > 0 && (
            <div className="bg-card rounded-xl border border-elevated p-6">
              <h3 className="text-lg font-bold text-accent-amber mb-4">Development Ratio Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={devTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
                  <XAxis dataKey="devTime" stroke="#737373" />
                  <YAxis stroke="#737373" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #f59e0b' }} />
                  <Bar dataKey="quality" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Origin Performance */}
          {originData.length > 0 && (
            <div className="bg-card rounded-xl border border-elevated p-6">
              <h3 className="text-lg font-bold text-accent-amber mb-4">Origin Performance</h3>
              <div className="space-y-3">
                {originData.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-elevated rounded-lg">
                    <div>
                      <p className="font-semibold text-text-primary">{item.origin}</p>
                      <p className="text-text-secondary text-xs">{item.roastCount} roasts</p>
                    </div>
                    <p className="text-accent-gold font-semibold">{item.averageQuality.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RoR Consistency */}
          {rorData.length > 0 && (
            <div className="bg-card rounded-xl border border-elevated p-6">
              <h3 className="text-lg font-bold text-accent-amber mb-4">RoR Consistency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
                  <XAxis type="number" dataKey="time" stroke="#737373" />
                  <YAxis type="number" dataKey="ror" stroke="#737373" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #f59e0b' }} />
                  <Scatter name="Roasts" data={rorData} fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Profiles */}
          {profileData.length > 0 && (
            <div className="bg-card rounded-xl border border-elevated p-6">
              <h3 className="text-lg font-bold text-accent-amber mb-4">Top Profiles</h3>
              <div className="space-y-3">
                {profileData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-elevated rounded-lg">
                    <div>
                      <p className="font-semibold text-text-primary">{item.profileName}</p>
                      <p className="text-text-secondary text-xs">{item.roastCount} uses, {(item.successRate * 100).toFixed(0)}% success</p>
                    </div>
                    <p className="text-accent-gold font-semibold">{item.averageQuality.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-card rounded-xl border border-elevated p-6">
            <h3 className="text-lg font-bold text-accent-amber mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                <p className="text-sm text-text-primary">Focus on medium roasts for Ethiopian coffees - consistent quality scores above 8.5</p>
              </div>
              <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-sm text-text-primary">Optimize development phase timing for Colombian origins - reduce variation by 5-10%</p>
              </div>
              <div className="p-3 bg-info/10 border border-info/30 rounded-lg">
                <p className="text-sm text-text-primary">Consider extending drying phase for natural processed coffees - improve sweetness scores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
