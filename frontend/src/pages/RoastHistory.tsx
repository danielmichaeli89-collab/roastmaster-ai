import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, BarChart2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Layout, LoadingSpinner, RoastChart } from '../components'
import { roastsAPI } from '../api'
import { Roast, TemperatureLog, RoastLevel } from '../types'

export const RoastHistory: React.FC = () => {
  const navigate = useNavigate()
  const [roasts, setRoasts] = useState<Roast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoast, setSelectedRoast] = useState<Roast | null>(null)
  const [tempLogs, setTempLogs] = useState<TemperatureLog[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])

  const [filters, setFilters] = useState({
    roastLevel: '',
    minQuality: 0,
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    loadRoasts()
  }, [filters])

  const loadRoasts = async () => {
    try {
      setIsLoading(true)
      const response = await roastsAPI.list(
        {
          roastLevel: filters.roastLevel as RoastLevel || undefined,
          minQualityRating: filters.minQuality || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
        1,
        50
      )
      setRoasts(response.data)
    } catch (err) {
      toast.error('Failed to load roasts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectRoast = async (roast: Roast) => {
    try {
      const logs = await roastsAPI.getTemperatureLogs(roast.id)
      setSelectedRoast(roast)
      setTempLogs(logs)
    } catch (err) {
      toast.error('Failed to load roast details')
    }
  }

  const toggleCompare = (roastId: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(roastId) ? prev.filter((id) => id !== roastId) : [...prev, roastId]
    )
  }

  const handleCompare = async () => {
    if (selectedForCompare.length < 2) {
      toast.error('Select at least 2 roasts to compare')
      return
    }

    try {
      const logs = await Promise.all(
        selectedForCompare.map((id) => roastsAPI.getTemperatureLogs(id))
      )
      // Combine logs for comparison view
      setTempLogs(logs.flat().sort((a: TemperatureLog, b: TemperatureLog) => a.elapsedSeconds - b.elapsedSeconds))
      setCompareMode(true)
    } catch (err) {
      toast.error('Failed to compare roasts')
    }
  }

  if (isLoading && roasts.length === 0) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
          <h3 className="text-amber-500 font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-espresso-400 text-sm mb-2">Roast Level</label>
              <select
                value={filters.roastLevel}
                onChange={(e) => setFilters((prev) => ({ ...prev, roastLevel: e.target.value }))}
                className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
              >
                <option value="">All</option>
                <option value="light">Light</option>
                <option value="medium_light">Medium Light</option>
                <option value="medium">Medium</option>
                <option value="medium_dark">Medium Dark</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-espresso-400 text-sm mb-2">Min Quality</label>
              <input
                type="number"
                min="0"
                max="10"
                value={filters.minQuality}
                onChange={(e) => setFilters((prev) => ({ ...prev, minQuality: Number(e.target.value) }))}
                className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-espresso-400 text-sm mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-espresso-400 text-sm mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roasts list */}
          <div className="lg:col-span-1">
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 space-y-3 max-h-[600px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-amber-500 font-semibold">Roasts ({roasts.length})</h3>
                {compareMode && (
                  <button
                    onClick={() => {
                      setCompareMode(false)
                      setSelectedForCompare([])
                    }}
                    className="text-sm text-espresso-400 hover:text-amber-500"
                  >
                    Exit Compare
                  </button>
                )}
              </div>

              {roasts.map((roast) => (
                <div
                  key={roast.id}
                  className={`p-3 rounded-lg border transition cursor-pointer ${
                    selectedRoast?.id === roast.id
                      ? 'bg-amber-900/50 border-amber-500'
                      : selectedForCompare.includes(roast.id)
                        ? 'bg-blue-900/30 border-blue-500'
                        : 'bg-espresso-800 border-espresso-700 hover:border-amber-500'
                  }`}
                  onClick={() => {
                    if (compareMode) {
                      toggleCompare(roast.id)
                    } else {
                      handleSelectRoast(roast)
                    }
                  }}
                >
                  <p className="font-semibold text-amber-500">{roast.batchNumber}</p>
                  <p className="text-espresso-400 text-xs">{roast.coffeeOrigin}</p>
                  {roast.qualityRating && (
                    <p className="text-amber-400 text-xs mt-1">⭐ {roast.qualityRating}/10</p>
                  )}
                </div>
              ))}
            </div>

            {compareMode && selectedForCompare.length >= 2 && (
              <button
                onClick={handleCompare}
                className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <BarChart2 size={16} />
                Compare {selectedForCompare.length} Roasts
              </button>
            )}
          </div>

          {/* Detail view */}
          <div className="lg:col-span-2">
            {selectedRoast && !compareMode ? (
              <div className="space-y-6">
                <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-amber-500 mb-4">{selectedRoast.batchNumber}</h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-espresso-400">Origin</p>
                      <p className="text-espresso-100 font-semibold">{selectedRoast.coffeeOrigin}</p>
                    </div>
                    <div>
                      <p className="text-espresso-400">Level</p>
                      <p className="text-espresso-100 font-semibold">{selectedRoast.roastLevel || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-espresso-400">Quality</p>
                      <p className="text-amber-500 font-semibold">
                        {selectedRoast.qualityRating ? `${selectedRoast.qualityRating}/10` : 'Not rated'}
                      </p>
                    </div>
                    <div>
                      <p className="text-espresso-400">Duration</p>
                      <p className="text-espresso-100 font-semibold">
                        {selectedRoast.roastDurationSeconds ? `${selectedRoast.roastDurationSeconds}s` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-espresso-400">Development %</p>
                      <p className="text-espresso-100 font-semibold">
                        {selectedRoast.targetDevelopmentTimeSeconds}
                      </p>
                    </div>
                    <div>
                      <p className="text-espresso-400">Date</p>
                      <p className="text-espresso-100 font-semibold">
                        {new Date(selectedRoast.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {tempLogs.length > 0 && <RoastChart data={tempLogs} height={350} />}

                <button
                  onClick={() => navigate(`/monitor/${selectedRoast.id}`)}
                  className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View Full Details
                </button>
              </div>
            ) : compareMode && selectedForCompare.length >= 2 ? (
              <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-amber-500 mb-4">Comparison</h3>
                {tempLogs.length > 0 && <RoastChart data={tempLogs} height={400} />}
              </div>
            ) : (
              <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 flex items-center justify-center min-h-[400px]">
                <p className="text-espresso-400 text-center">
                  {compareMode
                    ? 'Select roasts to compare'
                    : 'Select a roast to view details'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
