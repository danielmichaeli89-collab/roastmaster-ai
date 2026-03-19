import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, BarChart2, Search } from 'lucide-react'
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
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-accent-amber">Roast History</h2>
          <p className="text-text-secondary mt-1">Track and analyze your roasting sessions</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl border border-elevated p-6 space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-2">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search roasts..."
                  className="w-full pl-10 pr-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Roast Level</label>
              <select
                value={filters.roastLevel}
                onChange={(e) => setFilters((prev) => ({ ...prev, roastLevel: e.target.value }))}
                className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
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
              <label className="block text-sm font-medium text-text-primary mb-2">Min Quality</label>
              <input
                type="number"
                min="0"
                max="10"
                value={filters.minQuality}
                onChange={(e) => setFilters((prev) => ({ ...prev, minQuality: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roasts list */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-elevated p-6 space-y-3 max-h-[600px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-accent-amber">Roasts ({roasts.length})</h3>
                {compareMode && (
                  <button
                    onClick={() => {
                      setCompareMode(false)
                      setSelectedForCompare([])
                    }}
                    className="text-sm text-text-secondary hover:text-accent-amber transition"
                  >
                    Exit
                  </button>
                )}
              </div>

              {roasts.map((roast) => (
                <div
                  key={roast.id}
                  className={`p-3 rounded-lg border transition cursor-pointer ${
                    selectedRoast?.id === roast.id
                      ? 'bg-accent-amber/20 border-accent-amber'
                      : selectedForCompare.includes(roast.id)
                        ? 'bg-info/20 border-info'
                        : 'bg-elevated border-elevated hover:border-accent-amber'
                  }`}
                  onClick={() => {
                    if (compareMode) {
                      toggleCompare(roast.id)
                    } else {
                      handleSelectRoast(roast)
                    }
                  }}
                >
                  <p className="font-semibold text-accent-gold">{roast.batchNumber}</p>
                  <p className="text-text-secondary text-xs">{roast.coffeeOrigin}</p>
                  {roast.qualityRating && (
                    <p className="text-accent-gold text-xs mt-1">Rating: {Number(roast.qualityRating || 0).toFixed(1)}/10</p>
                  )}
                </div>
              ))}
            </div>

            {compareMode && selectedForCompare.length >= 2 && (
              <button
                onClick={handleCompare}
                className="w-full mt-3 px-4 py-2 bg-info text-primary rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 font-semibold"
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
                <div className="bg-card rounded-xl border border-elevated p-6">
                  <h3 className="text-2xl font-bold text-accent-amber mb-4">{selectedRoast.batchNumber}</h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Origin</p>
                      <p className="text-text-primary font-semibold">{selectedRoast.coffeeOrigin}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Level</p>
                      <p className="text-text-primary font-semibold">{selectedRoast.roastLevel || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Quality</p>
                      <p className="text-accent-gold font-semibold">
                        {selectedRoast.qualityRating ? `${Number(selectedRoast.qualityRating || 0).toFixed(1)}/10` : 'Not rated'}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Duration</p>
                      <p className="text-text-primary font-semibold">
                        {selectedRoast.roastDurationSeconds ? `${Math.round(selectedRoast.roastDurationSeconds / 60)}m ${selectedRoast.roastDurationSeconds % 60}s` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Dev Time</p>
                      <p className="text-text-primary font-semibold">
                        {selectedRoast.targetDevelopmentTimeSeconds}s
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Date</p>
                      <p className="text-text-primary font-semibold">
                        {new Date(selectedRoast.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {tempLogs.length > 0 && <RoastChart data={tempLogs} height={350} />}

                <button
                  onClick={() => navigate(`/monitor/${selectedRoast.id}`)}
                  className="w-full px-4 py-3 bg-accent-amber text-primary rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 font-semibold"
                >
                  <Eye size={16} />
                  View Full Details
                </button>
              </div>
            ) : compareMode && selectedForCompare.length >= 2 ? (
              <div className="bg-card rounded-xl border border-elevated p-6">
                <h3 className="text-lg font-bold text-accent-amber mb-4">Roast Comparison</h3>
                {tempLogs.length > 0 && <RoastChart data={tempLogs} height={400} />}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-elevated p-6 flex items-center justify-center min-h-[400px]">
                <p className="text-text-secondary text-center">
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
