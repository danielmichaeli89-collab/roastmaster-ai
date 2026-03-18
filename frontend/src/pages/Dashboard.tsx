import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Upload, BookPlus, Flame, Star, CheckCircle, Clock } from 'lucide-react'
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

        setStats(statsData)
        setRecentRoasts(roastsData.data)
        setTrendData(trendsData)
      } catch (err) {
        toast.error('Failed to load dashboard data')
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
      <div className="space-y-6">
        {/* Quick actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/monitor')}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={20} />
            Start New Roast
          </button>
          <button
            onClick={() => navigate('/history')}
            className="px-6 py-3 bg-espresso-800 border border-espresso-700 text-espresso-100 rounded-lg font-semibold hover:border-amber-500 transition flex items-center gap-2"
          >
            <Upload size={20} />
            Import CSV
          </button>
          <button
            onClick={() => navigate('/profiles')}
            className="px-6 py-3 bg-espresso-800 border border-espresso-700 text-espresso-100 rounded-lg font-semibold hover:border-amber-500 transition flex items-center gap-2"
          >
            <BookPlus size={20} />
            New Profile
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats && (
            <>
              <StatCard
                icon={Flame}
                title="Total Roasts"
                value={stats.totalRoasts}
                subtitle="all time"
              />
              <StatCard
                icon={Star}
                title="Average Quality"
                value={stats.averageQualityRating.toFixed(1)}
                subtitle="out of 10"
              />
              <StatCard
                icon={CheckCircle}
                title="Success Rate"
                value={`${(stats.successRate * 100).toFixed(1)}%`}
                subtitle="successful roasts"
              />
              <StatCard
                icon={Clock}
                title="Avg Dev Time"
                value={`${stats.averageDevelopmentTime.toFixed(1)}s`}
                subtitle="development phase"
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quality trends */}
          <div className="lg:col-span-2 bg-espresso-900 border border-espresso-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-500 mb-4">Quality Trends</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #d2691e' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#fbbf24"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-espresso-400 text-center py-8">No data available</p>
            )}
          </div>

          {/* Last roast */}
          {recentRoasts.length > 0 && (
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">Last Roast</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-espresso-400 text-sm">Batch</p>
                  <p className="text-espresso-100 font-semibold">{recentRoasts[0].batchNumber}</p>
                </div>
                <div>
                  <p className="text-espresso-400 text-sm">Origin</p>
                  <p className="text-espresso-100 font-semibold">{recentRoasts[0].coffeeOrigin}</p>
                </div>
                <div>
                  <p className="text-espresso-400 text-sm">Quality Rating</p>
                  <p className="text-amber-500 font-semibold">
                    {recentRoasts[0].qualityRating ? `${recentRoasts[0].qualityRating}/10` : 'Not rated'}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/history?roastId=${recentRoasts[0].id}`)}
                  className="w-full mt-4 px-4 py-2 bg-amber-900/50 border border-amber-500 text-amber-400 rounded-lg hover:bg-amber-900 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent roasts table */}
        <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-500 mb-4">Recent Roasts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso-700">
                  <th className="text-left py-3 px-4 text-espresso-400">Batch</th>
                  <th className="text-left py-3 px-4 text-espresso-400">Origin</th>
                  <th className="text-left py-3 px-4 text-espresso-400">Level</th>
                  <th className="text-left py-3 px-4 text-espresso-400">Quality</th>
                  <th className="text-left py-3 px-4 text-espresso-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRoasts.map((roast) => (
                  <tr
                    key={roast.id}
                    className="border-b border-espresso-800 hover:bg-espresso-800/50 transition"
                  >
                    <td className="py-3 px-4 font-semibold text-amber-500">{roast.batchNumber}</td>
                    <td className="py-3 px-4 text-espresso-300">{roast.coffeeOrigin}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-espresso-800 rounded text-espresso-300 text-xs">
                        {roast.roastLevel || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-500">
                      {roast.qualityRating ? `${roast.qualityRating}/10` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-espresso-400">
                      {new Date(roast.createdAt).toLocaleDateString()}
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
