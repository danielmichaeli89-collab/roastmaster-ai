import React from 'react'
import { X, AlertTriangle, AlertCircle } from 'lucide-react'
import { RoastAnomaly } from '../types'

interface AnomalyAlertProps {
  anomaly: RoastAnomaly
  onDismiss: () => void
  onAcknowledge: () => void
}

const severityColors = {
  low: { bg: 'bg-blue-900/30', border: 'border-blue-500', icon: 'text-blue-500' },
  medium: { bg: 'bg-yellow-900/30', border: 'border-yellow-500', icon: 'text-yellow-500' },
  high: { bg: 'bg-orange-900/30', border: 'border-orange-500', icon: 'text-orange-500' },
  critical: { bg: 'bg-red-900/30', border: 'border-red-500', icon: 'text-red-500' },
}

export const AnomalyAlert: React.FC<AnomalyAlertProps> = ({
  anomaly,
  onDismiss,
  onAcknowledge,
}) => {
  const colors = severityColors[anomaly.severity]
  const Icon = anomaly.severity === 'critical' ? AlertTriangle : AlertCircle

  return (
    <div
      className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-4 mb-3 animate-slide-up`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`${colors.icon} mt-1 flex-shrink-0`} size={20} />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-espresso-100 capitalize">
              {anomaly.anomalyType.replace(/_/g, ' ')}
            </h4>
            <p className="text-espresso-300 text-sm mt-1">
              {anomaly.affectedSensor}: {anomaly.expectedValue.toFixed(1)} expected,
              got {anomaly.actualValue.toFixed(1)} ({anomaly.deviationPercent.toFixed(1)}% deviation)
            </p>
            {anomaly.aiSuggestion && (
              <p className="text-amber-400 text-sm mt-2">
                <span className="font-semibold">AI Suggestion:</span> {anomaly.aiSuggestion}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4 flex-shrink-0">
          <button
            onClick={onAcknowledge}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 rounded text-white text-sm font-medium transition"
          >
            Acknowledge
          </button>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-espresso-700 rounded transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
