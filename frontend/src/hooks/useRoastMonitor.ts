import { useEffect, useCallback, useRef, useState } from 'react'
import { useSocket } from './useSocket'
import { RealtimeRoastData, RoastAnomaly } from '../types'

interface RoastMonitorState {
  roastData: RealtimeRoastData | null
  anomalies: RoastAnomaly[]
  isMonitoring: boolean
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
}

export const useRoastMonitor = (roastId: string) => {
  const { socket, on, emit, isConnected } = useSocket()
  const [state, setState] = useState<RoastMonitorState>({
    roastData: null,
    anomalies: [],
    isMonitoring: false,
    connectionStatus: 'disconnected',
  })

  const dataBufferRef = useRef<RealtimeRoastData[]>([])
  const anomalyAckRef = useRef<Set<string>>(new Set())

  const startMonitoring = useCallback(() => {
    if (!isConnected || !socket) return

    emit('roast:monitor:start', { roastId })
    setState((prev) => ({ ...prev, isMonitoring: true }))
  }, [socket, emit, isConnected, roastId])

  const stopMonitoring = useCallback(() => {
    if (!socket) return

    emit('roast:monitor:stop', { roastId })
    setState((prev) => ({ ...prev, isMonitoring: false }))
  }, [socket, emit, roastId])

  const updateControls = useCallback((controls: {
    power?: number
    airflow?: number
    fanRpm?: number
    motorRpm?: number
  }) => {
    emit('roast:control:update', {
      roastId,
      ...controls,
    })
  }, [emit, roastId])

  const acknowledgeAnomaly = useCallback((anomalyId: string) => {
    emit('roast:anomaly:acknowledge', { roastId, anomalyId })
    anomalyAckRef.current.add(anomalyId)
  }, [emit, roastId])

  // Set up real-time listeners
  useEffect(() => {
    if (!socket) return

    // Update connection status
    const handleConnect = () => {
      setState((prev) => ({ ...prev, connectionStatus: 'connected' }))
    }

    const handleDisconnect = () => {
      setState((prev) => ({ ...prev, connectionStatus: 'disconnected' }))
    }

    // Real-time roast data
    const handleRoastData = (data: RealtimeRoastData) => {
      dataBufferRef.current.push(data)

      // Keep only last 100 data points in memory
      if (dataBufferRef.current.length > 100) {
        dataBufferRef.current = dataBufferRef.current.slice(-100)
      }

      setState((prev) => ({
        ...prev,
        roastData: data,
      }))
    }

    // Anomalies
    const handleAnomaly = (anomaly: RoastAnomaly) => {
      if (anomalyAckRef.current.has(anomaly.id)) return

      setState((prev) => ({
        ...prev,
        anomalies: [...prev.anomalies, anomaly],
      }))
    }

    // Anomaly resolved
    const handleAnomalyResolved = (anomalyId: string) => {
      setState((prev) => ({
        ...prev,
        anomalies: prev.anomalies.map((a) =>
          a.id === anomalyId ? { ...a, resolved: true } : a
        ),
      }))
    }

    on('connect', handleConnect)
    on('disconnect', handleDisconnect)
    on('roast:data', handleRoastData)
    on('roast:anomaly', handleAnomaly)
    on('roast:anomaly:resolved', handleAnomalyResolved)

    return () => {
      // Cleanup is handled by useSocket
    }
  }, [socket, on])

  // Auto-start monitoring when roastId changes and socket is connected
  useEffect(() => {
    if (isConnected && !state.isMonitoring) {
      startMonitoring()
    }
  }, [isConnected, roastId, state.isMonitoring, startMonitoring])

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    updateControls,
    acknowledgeAnomaly,
    dataHistory: dataBufferRef.current,
  }
}
