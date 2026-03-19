import React, { useMemo } from 'react'

interface TemperatureGaugeProps {
  label: string
  current: number
  target?: number
  min?: number
  max?: number
  unit?: string
}

export const TemperatureGauge: React.FC<TemperatureGaugeProps> = ({
  label,
  current,
  target,
  min = 0,
  max = 250,
  unit = '°C',
}) => {
  const percentage = useMemo(() => {
    return ((current - min) / (max - min)) * 100
  }, [current, min, max])

  const getColor = () => {
    if (percentage < 30) return 'from-blue-500 to-blue-600'
    if (percentage < 60) return 'from-amber-500 to-amber-600'
    if (percentage < 85) return 'from-orange-500 to-orange-600'
    return 'from-error-500 to-error-600'
  }

  return (
    <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-espresso-300 text-sm font-medium">{label}</h3>
        <span className="text-amber-500 text-lg font-bold">
          {Number(current || 0).toFixed(1)}{unit}
        </span>
      </div>

      {/* Gauge bar */}
      <div className="relative h-8 bg-espresso-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between items-center text-espresso-500 text-xs">
        <span>{min}{unit}</span>
        {target !== undefined && (
          <span className="text-amber-400">Target: {target}{unit}</span>
        )}
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}
