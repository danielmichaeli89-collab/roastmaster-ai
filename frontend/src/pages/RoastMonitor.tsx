import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  Square,
  Zap,
  ZapOff,
  Eye,
  XCircle,
  Thermometer,
  Activity,
  Clock,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Gauge,
  ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'

// Types
interface RoastPhase {
  name: string
  startSeconds: number
  endSeconds: number
  targetStartTemp: number
  targetEndTemp: number
}

interface SimulatedRoastData {
  time: number
  timeLabel: string
  bt1: number
  bt2: number
  et: number
  ror: number
  target: number
  drumTemp: number
  exhaustTemp: number
  inletTemp: number
  pressure: number
}

interface ReadingCard {
  label: string
  value: number
  unit: string
  target: number
}

interface AIMessage {
  id: string
  type: 'success' | 'warning' | 'error'
  text: string
  timestamp: number
}

// Realistic roast profile phases
const ROAST_PHASES: RoastPhase[] = [
  { name: 'Drying', startSeconds: 0, endSeconds: 180, targetStartTemp: 100, targetEndTemp: 160 },
  { name: 'Maillard', startSeconds: 180, endSeconds: 420, targetStartTemp: 160, targetEndTemp: 190 },
  { name: 'Development', startSeconds: 420, endSeconds: 600, targetStartTemp: 190, targetEndTemp: 220 },
]

export const RoastMonitor: React.FC = () => {
  const navigate = useNavigate()
  // State: Controls
  const [power, setPower] = useState(65)
  const [airflow, setAirflow] = useState(45)
  const [drumRpm, setDrumRpm] = useState(72)
  const [isRoasting, setIsRoasting] = useState(false)

  // State: Roast data
  const [chartData, setChartData] = useState<SimulatedRoastData[]>([])
  const [currentPhase, setCurrentPhase] = useState<RoastPhase | null>(ROAST_PHASES[0])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [events, setEvents] = useState<Array<{ type: string; time: number }>>([])
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([])

  // References for simulation
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dataBufferRef = useRef<SimulatedRoastData[]>([])
  const aiMessageIdRef = useRef(0)

  // Realistic temperature curve simulation
  const generateRoastCurve = useCallback(
    (timeSeconds: number, powerPercent: number): { bt1: number; ror: number; et: number } => {
      // Base temperature influenced by power
      const powerInfluence = powerPercent / 100
      let btTemp = 80 + timeSeconds * 0.3 * powerInfluence

      // S-curve shape for realistic roast
      const progress = Math.min(timeSeconds / 600, 1)
      const sCurve = Math.sin(progress * Math.PI - Math.PI / 2) * 0.5 + 0.5
      btTemp = 80 + sCurve * 140 * powerInfluence

      // Rate of Rise: high at start, decreases over time
      let ror = 12 * Math.exp(-timeSeconds / 200) * powerInfluence
      ror = Math.max(2, ror)
      ror += (Math.random() - 0.5) * 1 // Add noise

      // ET is always higher than BT
      const et = btTemp + 15 + (Math.random() - 0.5) * 5

      return {
        bt1: Math.min(btTemp + (Math.random() - 0.5) * 3, 230),
        ror,
        et,
      }
    },
    []
  )

  // Update current phase based on elapsed time
  useEffect(() => {
    const phase = ROAST_PHASES.find(
      (p) => elapsedTime >= p.startSeconds && elapsedTime < p.endSeconds
    )
    setCurrentPhase(phase || null)
  }, [elapsedTime])

  // Auto-generate phase transition events
  useEffect(() => {
    if (elapsedTime === 170 && isRoasting && !events.find((e) => e.type === 'yellowing')) {
      setEvents((prev) => [...prev, { type: 'yellowing', time: elapsedTime }])
      addAiMessage('success', 'Yellowing detected. Transition to Maillard phase begins.')
    }

    if (elapsedTime === 200 && isRoasting && !events.find((e) => e.type === 'first_crack')) {
      setEvents((prev) => [...prev, { type: 'first_crack', time: elapsedTime }])
      addAiMessage('warning', 'First crack detected! Development phase initiated.')
    }

    if (elapsedTime === 230 && isRoasting && !events.find((e) => e.type === 'second_crack')) {
      setEvents((prev) => [...prev, { type: 'second_crack', time: elapsedTime }])
      addAiMessage('error', 'Second crack detected. Ready for drop within 30 seconds.')
    }
  }, [elapsedTime, isRoasting, events])

  // Add AI message helper
  const addAiMessage = useCallback((type: 'success' | 'warning' | 'error', text: string) => {
    const id = `msg-${aiMessageIdRef.current++}`
    setAiMessages((prev) => [
      ...prev,
      { id, type, text, timestamp: Date.now() },
    ])

    // Auto-remove older messages (keep last 5)
    setAiMessages((prev) => {
      if (prev.length > 5) {
        return prev.slice(-5)
      }
      return prev
    })
  }, [])

  // Main simulation loop
  useEffect(() => {
    if (!isRoasting) {
      if (simulationRef.current) {
        clearInterval(simulationRef.current)
      }
      return
    }

    simulationRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1

        if (newTime > 600) {
          setIsRoasting(false)
          toast.success('Roast simulation complete!')
          return prev
        }

        // Generate new data point
        const { bt1, ror, et } = generateRoastCurve(newTime, power)
        const btAvg = (bt1 + (bt1 - (Math.random() - 0.5) * 3)) / 2

        // Calculate target for this time
        const targetPhase = ROAST_PHASES.find(
          (p) => newTime >= p.startSeconds && newTime < p.endSeconds
        )
        const targetTemp = targetPhase
          ? targetPhase.targetStartTemp +
            ((newTime - targetPhase.startSeconds) / (targetPhase.endSeconds - targetPhase.startSeconds)) *
              (targetPhase.targetEndTemp - targetPhase.targetStartTemp)
          : 200

        const newDataPoint: SimulatedRoastData = {
          time: newTime,
          timeLabel: `${Math.floor(newTime / 60)}:${String(newTime % 60).padStart(2, '0')}`,
          bt1: Math.round(bt1 * 10) / 10,
          bt2: Math.round((bt1 - (Math.random() - 0.5) * 3) * 10) / 10,
          et: Math.round(et * 10) / 10,
          ror: Math.round(ror * 10) / 10,
          target: Math.round(targetTemp * 10) / 10,
          drumTemp: Math.round((btAvg + 20 + (Math.random() - 0.5) * 10) * 10) / 10,
          exhaustTemp: Math.round((et - 10 + (Math.random() - 0.5) * 5) * 10) / 10,
          inletTemp: Math.round((et + 5 + (Math.random() - 0.5) * 3) * 10) / 10,
          pressure: Math.round((1.2 + (ror / 20) * (airflow / 100)) * 100) / 100,
        }

        dataBufferRef.current.push(newDataPoint)
        if (dataBufferRef.current.length > 300) {
          dataBufferRef.current = dataBufferRef.current.slice(-300)
        }

        setChartData([...dataBufferRef.current])

        // AI messages every 30 seconds with context
        if (newTime % 30 === 0) {
          const messages = [
            { type: 'success', text: `RoR tracking profile at ${ror.toFixed(1)}°C/min. Development progressing well at ${btAvg.toFixed(0)}°C.` },
            { type: 'warning', text: `Consider adjusting power to ${power + 5}%. Temperature slightly below target.` },
            { type: 'success', text: 'Airflow distribution optimal. Bean temperature uniform across drum.' },
          ]
          const msg = messages[newTime % messages.length]
          addAiMessage(msg.type as any, msg.text)
        }

        return newTime
      })
    }, 1000)

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current)
      }
    }
  }, [isRoasting, power, airflow, generateRoastCurve, addAiMessage])

  // Handle roast start
  const handleStartRoast = () => {
    setIsRoasting(true)
    setElapsedTime(0)
    setChartData([])
    setEvents([])
    setAiMessages([])
    dataBufferRef.current = []
    toast.success('Roast started!')
  }

  // Handle roast stop
  const handleStopRoast = () => {
    setIsRoasting(false)
    toast.success('Roast stopped')
  }

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  // Handle emergency stop
  const handleEmergencyStop = () => {
    if (window.confirm('Emergency stop will immediately halt the roast. Continue?')) {
      setIsRoasting(false)
      toast.error('Emergency stop activated!')
    }
  }

  // Calculate metrics
  const currentBt1 = chartData.length > 0 ? chartData[chartData.length - 1].bt1 : 80
  const currentBt2 = chartData.length > 0 ? chartData[chartData.length - 1].bt2 : 80
  const currentEt = chartData.length > 0 ? chartData[chartData.length - 1].et : 100
  const currentRor = chartData.length > 0 ? chartData[chartData.length - 1].ror : 0
  const currentDrumTemp = chartData.length > 0 ? chartData[chartData.length - 1].drumTemp : 100
  const currentExhaustTemp = chartData.length > 0 ? chartData[chartData.length - 1].exhaustTemp : 90
  const currentInletTemp = chartData.length > 0 ? chartData[chartData.length - 1].inletTemp : 105
  const currentPressure = chartData.length > 0 ? chartData[chartData.length - 1].pressure : 1.0

  const devPercentage = Math.max(
    0,
    Math.min(
      100,
      ((elapsedTime - 420) / (600 - 420)) * 100
    )
  )

  // Helper to get delta badge color and direction
  const getDeltaBadge = (current: number, target: number) => {
    const diff = current - target
    const absDiff = Math.abs(diff)

    if (absDiff < 5) {
      return { color: 'text-success', icon: Minus, label: 'On target' }
    } else if (diff > 0) {
      return { color: 'text-warning', icon: TrendingUp, label: `+${diff.toFixed(1)}` }
    } else {
      return { color: 'text-info', icon: TrendingDown, label: `${diff.toFixed(1)}` }
    }
  }

  const readingCards: ReadingCard[] = [
    { label: 'BT1', value: currentBt1, unit: '°C', target: currentPhase?.targetEndTemp || 200 },
    { label: 'BT2', value: currentBt2, unit: '°C', target: currentPhase?.targetEndTemp || 200 },
    { label: 'ET', value: currentEt, unit: '°C', target: currentPhase?.targetEndTemp || 200 },
    { label: 'RoR', value: currentRor, unit: '°C/min', target: 8 },
    { label: 'Drum', value: currentDrumTemp, unit: '°C', target: 150 },
    { label: 'Exhaust', value: currentExhaustTemp, unit: '°C', target: 100 },
    { label: 'Inlet', value: currentInletTemp, unit: '°C', target: 105 },
    { label: 'Pressure', value: currentPressure, unit: 'bar', target: 1.5 },
  ]

  // Scroll AI messages to bottom
  const aiScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight
    }
  }, [aiMessages])

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-secondary border-b border-text-muted border-opacity-20 px-6 py-2">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <button onClick={handleBackToDashboard} className="flex items-center gap-1 hover:text-accent-amber transition">
            <ArrowLeft size={16} />
            Dashboard
          </button>
          <span>/</span>
          <span className="text-text-primary">Roast Monitor</span>
        </div>
      </div>

      {/* Top Status Bar */}
      <div className="bg-gradient-to-r from-secondary to-elevated border-b border-accent-amber border-opacity-20 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent-amber">RoastMonitor</h1>
          <p className="text-text-muted text-sm mt-1">Real-time roast control center</p>
        </div>
        <div className="text-right">
          <p className="text-text-muted text-sm">Status</p>
          <p className={`text-2xl font-mono font-bold ${isRoasting ? 'text-success animate-pulse' : 'text-text-secondary'}`}>
            {isRoasting ? '⚡ ROASTING' : '○ IDLE'}
          </p>
        </div>
      </div>

      {/* Main grid: Left | Center | Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Control Panel */}
        <div className="w-72 border-r border-accent-amber border-opacity-20 overflow-y-auto">
          <div className="bg-[#141414] p-6 space-y-6 min-h-full">
            {/* Section: ROAST CONTROLS */}
            <div>
              <h2 className="text-lg font-bold text-accent-amber mb-6 flex items-center gap-2">
                <Gauge size={20} />
                ROAST CONTROLS
              </h2>

              {/* Power Control */}
              <div className="mb-8 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-text-muted text-sm font-semibold">POWER</label>
                  <span className="px-3 py-1 bg-accent-amber bg-opacity-20 border border-accent-amber border-opacity-30 text-accent-amber rounded-full text-xs font-bold">
                    {power}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={power}
                  onChange={(e) => setPower(Number(e.target.value))}
                  disabled={!isRoasting}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-accent-amber"
                  style={{
                    background: `linear-gradient(to right, transparent 0%, #f59e0b ${power}%, #242424 ${power}%, #242424 100%)`,
                  }}
                />
              </div>

              {/* Airflow Control */}
              <div className="mb-8 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-text-muted text-sm font-semibold">AIRFLOW</label>
                  <span className="px-3 py-1 bg-info bg-opacity-20 border border-info border-opacity-30 text-info rounded-full text-xs font-bold">
                    {airflow}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={airflow}
                  onChange={(e) => setAirflow(Number(e.target.value))}
                  disabled={!isRoasting}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, transparent 0%, #3b82f6 ${airflow}%, #242424 ${airflow}%, #242424 100%)`,
                  }}
                />
              </div>

              {/* RPM Control */}
              <div className="mb-8 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-text-muted text-sm font-semibold">DRUM RPM</label>
                  <span className="px-3 py-1 bg-purple-500 bg-opacity-20 border border-purple-500 border-opacity-30 text-purple-400 rounded-full text-xs font-bold">
                    {drumRpm}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={drumRpm}
                  onChange={(e) => setDrumRpm(Number(e.target.value))}
                  disabled={!isRoasting}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, transparent 0%, #a855f7 ${drumRpm}%, #242424 ${drumRpm}%, #242424 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Section: ROAST EVENTS */}
            <div className="border-t border-text-muted border-opacity-20 pt-6">
              <h3 className="text-sm font-bold text-accent-amber mb-4 uppercase tracking-wider">Roast Events</h3>
              <div className="space-y-2">
                <button
                  onClick={handleStartRoast}
                  disabled={isRoasting}
                  className="w-full px-4 py-2 bg-success bg-opacity-20 border border-success border-opacity-40 text-success rounded-lg hover:bg-opacity-30 hover:border-opacity-60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Start Roast
                </button>

                <button
                  className="w-full px-4 py-2 bg-warning bg-opacity-20 border border-warning border-opacity-40 text-warning rounded-lg hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
                  disabled={!isRoasting}
                >
                  <Eye size={16} />
                  Mark Yellowing
                </button>

                <button
                  className="w-full px-4 py-2 bg-orange-500 bg-opacity-20 border border-orange-500 border-opacity-40 text-orange-400 rounded-lg hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
                  disabled={!isRoasting}
                >
                  <Zap size={16} />
                  Mark First Crack
                </button>

                <button
                  className="w-full px-4 py-2 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40 text-red-400 rounded-lg hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
                  disabled={!isRoasting}
                >
                  <ZapOff size={16} />
                  Mark Second Crack
                </button>

                <button
                  onClick={handleStopRoast}
                  disabled={!isRoasting}
                  className="w-full px-4 py-2 bg-danger bg-opacity-20 border border-danger border-opacity-40 text-danger rounded-lg hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Square size={16} />
                  Drop / End Roast
                </button>

                <button
                  onClick={handleEmergencyStop}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-bold text-sm flex items-center justify-center gap-2 animate-pulse"
                >
                  <XCircle size={18} />
                  EMERGENCY STOP
                </button>
              </div>
            </div>

            {/* Section: ACTIVE PROFILE */}
            <div className="border-t border-text-muted border-opacity-20 pt-6">
              <h3 className="text-sm font-bold text-accent-amber mb-3 uppercase tracking-wider">Active Profile</h3>
              <select className="w-full px-3 py-2 bg-elevated border border-text-muted border-opacity-20 text-text-primary rounded-lg text-sm">
                <option>Standard Espresso</option>
                <option>Medium Roast</option>
                <option>Light Roast</option>
              </select>
              {currentPhase && (
                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <p className="text-text-muted">Current Phase</p>
                    <p className="text-accent-amber font-semibold">{currentPhase.name}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">Target Temp Range</p>
                    <p className="text-info font-semibold">
                      {currentPhase.targetStartTemp}°C - {currentPhase.targetEndTemp}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">Expected Total Time</p>
                    <p className="text-success font-semibold">10 minutes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Main Chart */}
        <div className="flex-1 border-r border-accent-amber border-opacity-20 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Temperature Chart */}
            <div className="bg-secondary bg-opacity-50 border border-accent-amber border-opacity-10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">Temperature Profile</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 80, left: 0, bottom: 40 }}
                  >
                    <defs>
                      <linearGradient id="colorBt1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="timeLabel"
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                      domain={[0, 250]}
                      label={{
                        value: 'Temperature (°C)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: 'rgba(255,255,255,0.5)',
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      yAxisId="ror"
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                      domain={[0, 30]}
                      orientation="right"
                      label={{
                        value: 'RoR (°C/min)',
                        angle: 90,
                        position: 'insideRight',
                        fill: 'rgba(255,255,255,0.5)',
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(20, 20, 20, 0.95)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '8px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                      }}
                      labelStyle={{ color: '#fafafa', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fafafa' }}
                      formatter={(value: any) => (typeof value === 'number' ? value.toFixed(1) : value)}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: '20px',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '12px',
                      }}
                    />

                    {/* Reference lines */}
                    <ReferenceLine
                      y={170}
                      stroke="rgba(250, 204, 21, 0.3)"
                      strokeDasharray="5 5"
                      label={{
                        value: 'Yellowing (170°C)',
                        position: 'left',
                        fill: 'rgba(255,255,255,0.4)',
                        fontSize: 11,
                      }}
                    />
                    <ReferenceLine
                      y={200}
                      stroke="rgba(245, 158, 11, 0.3)"
                      strokeDasharray="5 5"
                      label={{
                        value: 'First Crack (200°C)',
                        position: 'left',
                        fill: 'rgba(255,255,255,0.4)',
                        fontSize: 11,
                      }}
                    />

                    {/* Data lines */}
                    <Line
                      type="monotone"
                      dataKey="bt1"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={false}
                      name="Bean Temp 1"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="bt2"
                      stroke="#d97706"
                      strokeWidth={2}
                      dot={false}
                      name="Bean Temp 2"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="et"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="Air Temp"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="ror"
                      stroke="#22c55e"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      yAxisId="ror"
                      name="Rate of Rise"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      strokeDasharray="8 4"
                      strokeOpacity={0.4}
                      dot={false}
                      name="Target Profile"
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-text-muted">
                  <p>Click "Start Roast" to begin</p>
                </div>
              )}
            </div>

            {/* Phase Timeline */}
            {chartData.length > 0 && (
              <div className="bg-secondary bg-opacity-50 border border-accent-amber border-opacity-10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-text-primary">Phase Timeline</h3>
                  <span className="text-accent-amber font-mono font-bold text-xl">
                    {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-3">
                  {ROAST_PHASES.map((phase, idx) => {
                    const isActive = elapsedTime >= phase.startSeconds && elapsedTime < phase.endSeconds
                    const isComplete = elapsedTime >= phase.endSeconds
                    const phaseProgress =
                      isActive
                        ? ((elapsedTime - phase.startSeconds) / (phase.endSeconds - phase.startSeconds)) * 100
                        : isComplete
                          ? 100
                          : 0

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border transition-all ${
                          isActive
                            ? 'bg-accent-amber bg-opacity-10 border-accent-amber border-opacity-50'
                            : isComplete
                              ? 'bg-success bg-opacity-10 border-success border-opacity-30'
                              : 'bg-text-muted bg-opacity-5 border-text-muted border-opacity-20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-text-primary">{phase.name}</p>
                          <p className="text-sm text-text-muted">
                            {phase.startSeconds}s - {phase.endSeconds}s
                          </p>
                        </div>
                        <div className="w-full h-2 bg-text-muted bg-opacity-20 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isActive
                                ? 'bg-accent-amber'
                                : isComplete
                                  ? 'bg-success'
                                  : 'bg-text-muted'
                            }`}
                            style={{ width: `${phaseProgress}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Development percentage */}
                {currentPhase?.name === 'Development' && (
                  <div className="mt-4 p-4 bg-accent-amber bg-opacity-10 border border-accent-amber border-opacity-20 rounded-lg">
                    <p className="text-sm text-text-muted mb-2">Development Ratio</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-accent-amber">{devPercentage.toFixed(1)}</span>
                      <span className="text-text-muted mb-1">%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Roast Summary */}
            {chartData.length > 0 && (
              <div className="bg-secondary bg-opacity-50 border border-accent-amber border-opacity-10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Roast Summary</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-elevated bg-opacity-50 rounded-lg p-4 border border-text-muted border-opacity-10">
                    <p className="text-text-muted text-xs">Total Time</p>
                    <p className="text-accent-amber font-mono font-bold text-lg mt-1">
                      {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                    </p>
                  </div>
                  <div className="bg-elevated bg-opacity-50 rounded-lg p-4 border border-text-muted border-opacity-10">
                    <p className="text-text-muted text-xs">Dev Time</p>
                    <p className="text-info font-mono font-bold text-lg mt-1">
                      {Math.max(0, elapsedTime - 420)}s
                    </p>
                  </div>
                  <div className="bg-elevated bg-opacity-50 rounded-lg p-4 border border-text-muted border-opacity-10">
                    <p className="text-text-muted text-xs">Dev Ratio</p>
                    <p className="text-success font-mono font-bold text-lg mt-1">{devPercentage.toFixed(1)}%</p>
                  </div>
                  <div className="bg-elevated bg-opacity-50 rounded-lg p-4 border border-text-muted border-opacity-10">
                    <p className="text-text-muted text-xs">Est. Weight Loss</p>
                    <p className="text-warning font-mono font-bold text-lg mt-1">12-15%</p>
                  </div>
                </div>

                {!isRoasting && chartData.length > 0 && (
                  <div className="mt-6 p-4 bg-accent-amber/10 border border-accent-amber/30 rounded-lg space-y-3">
                    <p className="text-accent-amber font-semibold">Roast Complete</p>
                    <div className="flex gap-3">
                      <button className="flex-1 px-4 py-2 bg-accent-amber text-primary rounded-lg hover:shadow-lg transition font-semibold text-sm">
                        View Analysis
                      </button>
                      <button
                        onClick={handleBackToDashboard}
                        className="flex-1 px-4 py-2 bg-elevated border border-text-muted/30 text-text-primary rounded-lg hover:border-accent-amber transition font-semibold text-sm"
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Intelligence Panel */}
        <div className="w-80 border-l border-accent-amber border-opacity-20 overflow-y-auto">
          <div className="bg-[#141414] p-6 space-y-6 min-h-full">
            {/* Section: LIVE READINGS */}
            <div>
              <h3 className="text-lg font-bold text-accent-amber mb-4 flex items-center gap-2">
                <Thermometer size={20} />
                LIVE READINGS
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {readingCards.map((card, idx) => {
                  const delta = getDeltaBadge(card.value, card.target)
                  const DeltaIcon = delta.icon

                  return (
                    <div
                      key={idx}
                      className="bg-elevated bg-opacity-50 border border-text-muted border-opacity-20 rounded-lg p-3 hover:border-opacity-40 transition-all"
                    >
                      <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">
                        {card.label}
                      </p>
                      <p className="text-2xl font-mono font-bold text-text-primary">
                        {Number(card.value || 0).toFixed(1)}
                      </p>
                      <p className="text-xs text-text-muted">{card.unit}</p>
                      <div className={`flex items-center gap-1 mt-2 ${delta.color} text-xs font-semibold`}>
                        <DeltaIcon size={12} />
                        {delta.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Section: AI COPILOT */}
            <div className="border-t border-text-muted border-opacity-20 pt-6">
              <h3 className="text-lg font-bold text-accent-amber mb-4 flex items-center gap-2">
                <Brain size={20} />
                AI COPILOT
              </h3>

              <div
                ref={aiScrollRef}
                className="h-48 overflow-y-auto space-y-3 bg-elevated bg-opacity-30 rounded-lg p-4 border border-text-muted border-opacity-10"
              >
                {aiMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-text-muted text-sm text-center">
                    <p>Waiting for AI analysis...</p>
                  </div>
                ) : (
                  aiMessages.map((msg) => {
                    const colorMap = {
                      success: { border: 'border-l-4 border-l-success', icon: 'text-success' },
                      warning: { border: 'border-l-4 border-l-warning', icon: 'text-warning' },
                      error: { border: 'border-l-4 border-l-danger', icon: 'text-danger' },
                    }
                    const style = colorMap[msg.type]

                    return (
                      <div key={msg.id} className={`${style.border} bg-text-muted bg-opacity-5 rounded px-3 py-2`}>
                        <p className="text-xs text-text-primary leading-relaxed">{msg.text}</p>
                        <p className="text-xs text-text-muted mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Section: ROAST TIMER */}
            <div className="border-t border-text-muted border-opacity-20 pt-6">
              <h3 className="text-lg font-bold text-accent-amber mb-4 flex items-center gap-2">
                <Clock size={20} />
                ROAST TIMER
              </h3>

              <div className="bg-gradient-to-br from-elevated to-secondary rounded-lg p-6 border border-accent-amber border-opacity-20">
                <p className="text-center text-accent-amber font-mono text-6xl font-bold tracking-wider">
                  {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                </p>

                {currentPhase && (
                  <div className="mt-6 space-y-3">
                    <div className="text-center">
                      <p className="text-text-muted text-xs uppercase tracking-wider">Current Phase</p>
                      <p className="text-text-primary font-bold text-lg">{currentPhase.name}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-text-muted text-xs uppercase tracking-wider">Phase Elapsed</p>
                      <p className="text-info font-mono font-bold text-lg">
                        {Math.max(0, elapsedTime - currentPhase.startSeconds)}s /{' '}
                        {currentPhase.endSeconds - currentPhase.startSeconds}s
                      </p>
                    </div>

                    <div className="w-full h-2 bg-text-muted bg-opacity-20 rounded-full overflow-hidden mt-4">
                      <div
                        className="h-full bg-gradient-to-r from-accent-amber to-accent-copper transition-all"
                        style={{
                          width: `${((elapsedTime - currentPhase.startSeconds) / (currentPhase.endSeconds - currentPhase.startSeconds)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-text-muted border-opacity-20 text-center">
                  <p className="text-text-muted text-xs uppercase tracking-wider">Est. Drop Time</p>
                  <p className="text-success font-mono font-bold text-lg mt-1">10:00</p>
                </div>
              </div>
            </div>

            {/* Roast Events List */}
            {events.length > 0 && (
              <div className="border-t border-text-muted border-opacity-20 pt-6">
                <h3 className="text-sm font-bold text-accent-amber mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} />
                  Events
                </h3>
                <div className="space-y-2">
                  {events.map((event, idx) => (
                    <div key={idx} className="bg-elevated bg-opacity-50 rounded p-2 border border-text-muted border-opacity-20">
                      <p className="text-xs text-text-muted uppercase">{event.type}</p>
                      <p className="text-sm text-text-primary font-mono">
                        {Math.floor(event.time / 60)}:{String(event.time % 60).padStart(2, '0')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
