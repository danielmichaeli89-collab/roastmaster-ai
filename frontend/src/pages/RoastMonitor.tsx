import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, Play, Square } from 'lucide-react'
import toast from 'react-hot-toast'
import { Layout, LoadingSpinner, RoastChart, TemperatureGauge, PhaseTimeline, AnomalyAlert } from '../components'
import { useRoastMonitor } from '../hooks'
import { roastsAPI } from '../api'
import { Roast, TemperatureLog, ProfilePhase } from '../types'

export const RoastMonitor: React.FC = () => {
  const { roastId } = useParams<{ roastId: string }>()
  const [roast, setRoast] = useState<Roast | null>(null)
  const [phases] = useState<ProfilePhase[]>([])
  const [tempLogs, setTempLogs] = useState<TemperatureLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissedAnomalies, setDismissedAnomalies] = useState<Set<string>>(new Set())

  const monitor = useRoastMonitor(roastId || '')

  useEffect(() => {
    const loadRoastData = async () => {
      if (!roastId) return

      try {
        setIsLoading(true)
        const [roastData, logsData] = await Promise.all([
          roastsAPI.get(roastId),
          roastsAPI.getTemperatureLogs(roastId),
        ])

        setRoast(roastData)
        setTempLogs(logsData)

        if (roastData.roastProfileId) {
          // Load phases from profile if needed
        }
      } catch (err) {
        toast.error('Failed to load roast data')
      } finally {
        setIsLoading(false)
      }
    }

    loadRoastData()
  }, [roastId])

  const handleStart = async () => {
    if (!roastId) return

    try {
      await roastsAPI.startRoast(roastId)
      toast.success('Roast started')
    } catch (err) {
      toast.error('Failed to start roast')
    }
  }

  const handleStop = async () => {
    if (!roastId) return

    try {
      await roastsAPI.stopRoast(roastId)
      toast.success('Roast stopped')
    } catch (err) {
      toast.error('Failed to stop roast')
    }
  }

  const handleEmergencyStop = async () => {
    if (!roastId) return

    if (!window.confirm('Are you sure? This will immediately stop the roast.')) {
      return
    }

    try {
      await roastsAPI.emergencyStop(roastId)
      toast.error('Emergency stop activated')
    } catch (err) {
      toast.error('Failed to activate emergency stop')
    }
  }

  const handlePowerChange = (value: number) => {
    monitor.updateControls({ power: value })
  }

  const handleAirflowChange = (value: number) => {
    monitor.updateControls({ airflow: value })
  }

  const handleRpmChange = (value: number) => {
    monitor.updateControls({ motorRpm: value })
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  const visibleAnomalies = monitor.anomalies.filter(
    (a) => !dismissedAnomalies.has(a.id) && !a.resolved
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Status bar */}
        <div className="bg-gradient-to-r from-espresso-900 to-espresso-800 border border-espresso-700 rounded-lg p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-amber-500">{roast?.batchNumber}</h2>
            <p className="text-espresso-400">{roast?.coffeeOrigin} • {roast?.roastLevel || 'In Progress'}</p>
          </div>
          <div className="text-right">
            <p className="text-espresso-400 text-sm">Status</p>
            <p className={`text-xl font-semibold ${monitor.isMonitoring ? 'text-success-500' : 'text-espresso-400'}`}>
              {monitor.isMonitoring ? '● Monitoring' : '○ Idle'}
            </p>
          </div>
        </div>

        {/* Anomalies */}
        {visibleAnomalies.length > 0 && (
          <div className="space-y-3">
            {visibleAnomalies.map((anomaly) => (
              <AnomalyAlert
                key={anomaly.id}
                anomaly={anomaly}
                onDismiss={() => setDismissedAnomalies((prev) => new Set([...prev, anomaly.id]))}
                onAcknowledge={() => monitor.acknowledgeAnomaly(anomaly.id)}
              />
            ))}
          </div>
        )}

        {/* Main chart */}
        <RoastChart
          data={tempLogs}
          height={500}
          title="Real-Time Roast Curve"
          includeLines={['bt1', 'bt2', 'drum']}
        />

        {/* Control panel and gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control panel */}
          <div className="lg:col-span-1 bg-espresso-900 border border-espresso-800 rounded-lg p-6 h-fit space-y-4">
            <h3 className="text-amber-500 font-semibold">Controls</h3>

            <div>
              <label className="text-espresso-400 text-sm mb-2 block">Power: {Math.round(monitor.roastData?.controls.power || 0)}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={monitor.roastData?.controls.power || 0}
                onChange={(e) => handlePowerChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-espresso-400 text-sm mb-2 block">Airflow: {Math.round(monitor.roastData?.controls.airflow || 0)}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={monitor.roastData?.controls.airflow || 0}
                onChange={(e) => handleAirflowChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-espresso-400 text-sm mb-2 block">RPM: {Math.round(monitor.roastData?.controls.motorRpm || 0)}</label>
              <input
                type="range"
                min="0"
                max="1000"
                value={monitor.roastData?.controls.motorRpm || 0}
                onChange={(e) => handleRpmChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="pt-4 border-t border-espresso-700 space-y-2">
              <button
                onClick={handleStart}
                className="w-full px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <Play size={16} />
                Start
              </button>
              <button
                onClick={handleStop}
                className="w-full px-4 py-2 bg-warning-600 hover:bg-warning-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <Square size={16} />
                Stop
              </button>
              <button
                onClick={handleEmergencyStop}
                className="w-full px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <AlertTriangle size={16} />
                Emergency
              </button>
            </div>
          </div>

          {/* Temperature gauges */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            {monitor.roastData && (
              <>
                <TemperatureGauge
                  label="Bean 1"
                  current={monitor.roastData.temperatures.bt1}
                  target={120}
                />
                <TemperatureGauge
                  label="Bean 2"
                  current={monitor.roastData.temperatures.bt2}
                  target={120}
                />
                <TemperatureGauge
                  label="Air"
                  current={monitor.roastData.temperatures.air}
                  target={140}
                />
                <TemperatureGauge
                  label="Drum"
                  current={monitor.roastData.temperatures.drum}
                  target={150}
                />
                <TemperatureGauge
                  label="Exhaust"
                  current={monitor.roastData.temperatures.exhaust}
                  target={100}
                />
                <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-4">
                  <p className="text-espresso-400 text-sm font-medium">Pressure</p>
                  <p className="text-amber-500 text-lg font-bold mt-2">
                    {monitor.roastData.pressure.toFixed(2)} bar
                  </p>
                  <p className="text-espresso-500 text-xs mt-2">0.0 - 3.0 bar</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Phase timeline */}
        {phases.length > 0 && (
          <PhaseTimeline
            phases={phases}
            currentTime={monitor.roastData?.elapsedSeconds || 0}
          />
        )}

        {/* Metadata */}
        <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-espresso-400">Elapsed</p>
              <p className="text-amber-500 font-semibold">
                {monitor.roastData ? `${monitor.roastData.elapsedSeconds}s` : '0s'}
              </p>
            </div>
            <div>
              <p className="text-espresso-400">Development %</p>
              <p className="text-amber-500 font-semibold">
                {monitor.roastData ? `${monitor.roastData.developmentPercent.toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div>
              <p className="text-espresso-400">RoR</p>
              <p className="text-amber-500 font-semibold">
                {monitor.roastData ? `${monitor.roastData.rateOfRise.toFixed(1)}°C/s` : '0°C/s'}
              </p>
            </div>
            <div>
              <p className="text-espresso-400">Connection</p>
              <p className={`font-semibold ${
                monitor.connectionStatus === 'connected' ? 'text-success-500' : 'text-error-500'
              }`}>
                {monitor.connectionStatus}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
