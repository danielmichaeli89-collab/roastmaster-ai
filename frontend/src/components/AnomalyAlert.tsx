import React from 'react'
import { X, AlertTriangle, AlertCircle, Zap } from 'lucide-react'
import { RoastAnomaly } from '../types'

interface AnomalyAlertProps {
  anomaly: RoastAnomaly
  onDismiss: () => void
  onAcknowledge: () => void
}

const severityConfig = {
  low: {
    bg: 'bg-info bg-opacity-10',
    border: 'border-info border-opacity-30',
    badge: 'bg-info bg-opacity-20 text-info',
    icon: 'text-info',
  },
  medium: {
    bg: 'bg-warning bg-opacity-10',
    border: 'border-warning border-opacity-30',
    badge: 'bg-warning bg-opacity-20 text-warning',
    icon: 'text-warning',
  },
  high: {
    bg: 'bg-danger bg-opacity-10',
    border: 'border-danger border-opacity-40',
    badge: 'bg-danger bg-opacity-20 text-danger',
    icon: 'text-danger',
  },
  critical: {
    bg: 'bg-danger bg-opacity-20',
    border: 'border-danger border-opacity-60',
    badge: 'bg-danger bg-opacity-30 text-danger animate-pulse-glow',
    icon: 'text-danger',
  },
}

export const AnomalyAlert: React.FC<AnomalyAlertProps> = ({
  anomaly,
  onDismiss,
  onAcknowledge,
}) => {
  const config = severityConfig[anomaly.severity]
  const Icon = anomaly.severity === 'critical' || anomaly.severity === 'high' ? AlertTriangle : AlertCircle

  return (
    <div
      className={`${config.bg} border border-l-4 ${config.border} rounded-xl p-6 mb-4 animate-slide-up backdrop-blur-glass`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-2 rounded-lg ${config.badge} flex-shrink-0`}>
            <Icon size={20} />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h4 className="font-bold text-text-primary capitalize text-lg">
                {anomaly.anomalyType.replace(/_/g, ' ')}
              </h4>
              <p className={`text-sm font-semibold mt-1 ${config.icon}`}>
                Severity: {anomaly.severity.toUpperCase()}
              </p>
            </div>

            <div className="bg-black bg-opacity-30 rounded-lg p-3 border border-text-muted border-opacity-10">
              <p className="text-text-muted text-sm">
                <span className="font-semibold text-text-primary">{anomaly.affectedSensor}:</span>
              </p>
              <p className="text-text-primary font-mono text-sm mt-1">
                Expected: {anomaly.expectedValue.toFixed(1)} | Got: {anomaly.actualValue.toFixed(1)}
              </p>
              <p className="text-danger text-sm font-semibold mt-2">
                {anomaly.deviationPercent.toFixed(1)}% deviation
              </p>
            </div>

            {anomaly.aiSuggestion && (
              <div className="bg-accent-amber bg-opacity-5 border border-accent-amber border-opacity-20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Zap size={16} className="text-accent-amber mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-accent-amber font-semibold text-sm">AI Recommendation</p>
                    <p className="text-text-primary text-sm mt-1">{anomaly.aiSuggestion}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4 flex-shrink-0">
          <button
            onClick={onAcknowledge}
            className="px-4 py-2 bg-accent-amber bg-opacity-10 border border-accent-amber border-opacity-20 text-accent-amber rounded-lg hover:bg-opacity-20 hover:border-opacity-40 transition-all duration-200 font-semibold text-sm whitespace-nowrap"
          >
            Acknowledge
          </button>
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-text-muted hover:bg-opacity-10 rounded-lg transition-colors"
            title="Dismiss"
          >
            <X size={18} className="text-text-muted" />
          </button>
        </div>
      </div>
    </div>
  )
}
