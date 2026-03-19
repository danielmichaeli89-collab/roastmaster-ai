import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  BookPlus,
  Flame,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Layout, LoadingSpinner, StatCard } from '../components'
import { roastsAPI, analyticsAPI } from '../api'
import { Roast, RoastStats } from '../types'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<RoastStats | null>(null)
  const [recentRoasts, setRecentRoasts] = useState<Roast[]>([])
  const [trendData, setTrendData] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [statsData, roastsData, trendsData] = await Promise.all([
          analyticsAPI.getStats(),
          roastsAPI.list({}, 1, 5),
          analyticsAPI.getQualityTrends('month'),
        ])

        // Map backend response to frontend expected format
        setStats({
          totalRoasts: parseInt(statsData?.totalRoasts) || 0,
          averageQualityRating: parseFloat(statsData?.averageQualityRating || statsData?.avgDevelopmentPct) || 0,
          successRate: parseFloat(statsData?.successRate) || 0,
          averageDevelopmentTime: parseFloat(statsData?.averageDevelopmentTime || statsData?.avgDevelopmentPct) || 0,
          averageFirstCrackTime: parseFloat(statsData?.averageFirstCrackTime) || 0,
          lastRoastDate: statsData?.lastRoastDate || new Date().toISOString(),
        })
        setRecentRoasts(Array.isArray(roastsData?.data) ? roastsData.data : Array.isArray(roastsData) ? roastsData : [])
        setTrendData(Array.isArray(trendsData?.timeline) ? trendsData.timeline : Array.isArray(trendsData) ? trendsData : [])
      } catch (err) {
        // Show demo data on error
        console.error('Failed to load dashboard data:', err)
        setStats({
          totalRoasts: 24,
          averageQualityRating: 7.8,
          successRate: 0.92,
          averageDevelopmentTime: 285,
          averageFirstCrackTime: 185,
          lastRoastDate: new Date().toISOString(),
        })
        setRecentRoasts([])
        setTrendData(
          Array.from({ length: 12 }, (_, i) => ({
            date: `Day ${i + 1}`,
            score: 7 + Math.random() * 2,
          }))
        )
        toast.success('Showing demo data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Quick action buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/monitor')}
            className="px-6 py-3 bg-gradient-to-r from-accent-amber to-accent-gold text-primary rounded-lg font-semibold hover:shadow-elevation transition-all duration-200 flex items-center gap-2 group"
          >
            <Flame size={20} className="group-hover:animate-pulse" />
            Start New Roast
          </button>
          <button
            onClick={() => navigate('/history')}
            className="px-6 py-3 glass-card border border-accent-amber border-opacity-20 text-text-primary rounded-lg font-semibold hover:border-opacity-40 transition-all duration-200 flex items-center gap-2"
          >
            <Upload size={20} />
            Import CSV
          </button>
          <button
            onClick={() => navigate('/profiles/new')}
            className="px-6 py-3 glass-card border border-accent-amber border-opacity-20 text-text-primary rounded-lg font-semibold hover:border-opacity-40 transition-all duration-200 flex items-center gap-2"
          >
            <BookPlus size={20} />
            Create AI Profile
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats && (
            <>
              <StatCard
                icon={<Flame size={24} />}
                title="Total Roasts"
                value={stats.totalRoasts}
                unit="roasts"
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                icon={<Star size={24} />}
                title="Average Quality"
                value={Number(stats.averageQualityRating || 0).toFixed(1)}
                unit="/ 10"
                trend={{ value: 5, isPositive: true }}
              />
              <StatCard
                icon={<CheckCircle size={24} />}
                title="Success Rate"
                value={`${(Number(stats.successRate || 0) * 100).toFixed(0)}%`}
                trend={{ value: 3, isPositive: true }}
              />
              <StatCard
                icon={<Clock size={24} />}
                title="Avg Dev Time"
                value={Number(stats.averageDevelopmentTime || 0).toFixed(0)}
                unit="s"
                trend={{ value: 2, isPositive: false }}
              />
            </>
          )}
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quality trends - main chart */}
          <div className="lg:col-span-2 glass-card border border-accent-amber border-opacity-10 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary">Quality Trends</h3>
                <p className="text-text-muted text-sm mt-1">Last 30 roasts</p>
              </div>
              <TrendingUp size={24} className="text-success" />
            </div>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141414',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fafafa' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-text-muted">
                No quality data available yet
              </div>
            )}
          </div>

          {/* Last roast card */}
          {recentRoasts.length > 0 && (
            <div className="glass-card border border-accent-amber border-opacity-10 rounded-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Flame size={20} className="text-accent-amber" />
                <h3 className="text-xl font-bold text-text-primary">Last Roast</h3>
              </div>

              <div className="space-y-4">
                <div className="pb-4 border-b border-elevated">
                  <p className="text-text-muted text-sm mb-1">Batch Number</p>
                  <p className="text-text-primary font-semibold">{recentRoasts[0].batchNumber}</p>
                </div>

                <div className="pb-4 border-b border-elevated">
                  <p className="text-text-muted text-sm mb-1">Origin</p>
                  <p className="text-text-primary font-semibold">{recentRoasts[0].coffeeOrigin}</p>
                </div>

                <div className="pb-4">
                  <p className="text-text-muted text-sm mb-1">Quality Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-accent-amber font-bold text-2xl">
                      {recentRoasts[0].qualityRating ? Number(recentRoasts[0].qualityRating || 0).toFixed(1) : '-'}
                    </p>
                    <p className="text-text-muted">/10</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/history?roastId=${recentRoasts[0].id}`)}
                  className="w-full mt-6 px-4 py-2 bg-accent-amber bg-opacity-10 border border-accent-amber border-opacity-20 text-accent-amber rounded-lg hover:bg-opacity-20 hover:border-opacity-40 transition-all duration-200 font-medium text-sm"
                >
                  View Full Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent roasts table */}
        <div className="glass-card border border-accent-amber border-opacity-10 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-text-primary">Recent Roasts</h3>
              <p className="text-text-muted text-sm mt-1">Your last 5 roasts</p>
            </div>
            <Database size={24} className="text-text-muted" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-elevated">
                  <th className="text-left py-4 px-4 text-text-muted font-semibold text-sm">Batch</th>
                  <th className="text-left py-4 px-4 text-text-muted font-semibold text-sm">Origin</th>
                  <th className="text-left py-4 px-4 text-text-muted font-semibold text-sm">Level</th>
                  <th className="text-left py-4 px-4 text-text-muted font-semibold text-sm">Quality</th>
                  <th className="text-left py-4 px-4 text-text-muted font-semibold text-sm">Date</th>
                  <th className="text-left py-4 px-4 text-text-muted font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRoasts.map((roast) => (
                  <tr
                    key={roast.id}
                    className="border-b border-elevated hover:bg-elevated hover:bg-opacity-30 transition-colors duration-200 cursor-pointer"
                    onClick={() => navigate(`/history?roastId=${roast.id}`)}
                  >
                    <td className="py-4 px-4">
                      <p className="font-semibold text-accent-amber">{roast.batchNumber}</p>
                    </td>
                    <td className="py-4 px-4 text-text-primary">{roast.coffeeOrigin}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-amber bg-opacity-10 text-accent-amber">
                        {roast.roastLevel || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-accent-gold">
                        {roast.qualityRating ? `${Number(roast.qualityRating || 0).toFixed(1)}/10` : 'Unrated'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-text-muted text-sm">
                      {new Date(roast.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          roast.isSuccess
                            ? 'bg-success bg-opacity-10 text-success'
                            : roast.isSuccess === false
                              ? 'bg-danger bg-opacity-10 text-danger'
                              : 'bg-warning bg-opacity-10 text-warning'
                        }`}
                      >
                        {roast.isSuccess ? 'Success' : roast.isSuccess === false ? 'Failed' : 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
