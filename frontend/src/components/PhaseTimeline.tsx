import React from 'react'
import { ProfilePhase } from '../types'
import { CheckCircle2, Clock } from 'lucide-react'

interface PhaseTimelineProps {
  phases: ProfilePhase[]
  currentTime: number
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({ phases, currentTime }) => {
  const maxTime = Math.max(...phases.map((p) => p.endSeconds), currentTime)
  const progressPercent = (currentTime / maxTime) * 100

  return (
    <div className="space-y-6">
      {/* Main progress bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-text-primary">Roast Progress</h3>
          <p className="text-accent-amber font-mono font-bold text-2xl">
            {Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, '0')}
          </p>
        </div>

        <div className="relative h-8 bg-elevated rounded-lg overflow-hidden border border-accent-amber border-opacity-20">
          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-amber via-accent-gold to-accent-copper transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Progress glow effect */}
          {progressPercent > 0 && progressPercent < 100 && (
            <div
              className="absolute top-0 h-full w-1 bg-accent-gold blur-md opacity-50"
              style={{ left: `${progressPercent}%` }}
            />
          )}

          {/* Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity" />
        </div>

        <div className="flex justify-between mt-2 text-xs text-text-muted">
          <span>0s</span>
          <span className="font-mono">{maxTime}s total</span>
        </div>
      </div>

      {/* Phase cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phases.map((phase) => {
          const isActive = currentTime >= phase.startSeconds && currentTime < phase.endSeconds
          const isComplete = currentTime >= phase.endSeconds
          const isDuration = phase.durationSeconds

          return (
            <div
              key={phase.id}
              className={`glass-card border rounded-lg p-4 transition-all duration-300 ${
                isActive
                  ? 'border-accent-amber border-opacity-100 bg-accent-amber bg-opacity-5'
                  : isComplete
                    ? 'border-success border-opacity-30'
                    : 'border-text-muted border-opacity-10'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-text-muted text-xs font-semibold uppercase tracking-wide">
                    {phase.phaseName}
                  </p>
                  <p className="text-text-primary font-semibold mt-1">
                    {isDuration}s
                  </p>
                </div>
                {isComplete ? (
                  <CheckCircle2 size={20} className="text-success" />
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full bg-accent-amber animate-pulse-glow" />
                ) : (
                  <Clock size={20} className="text-text-muted opacity-50" />
                )}
              </div>

              <p className="text-text-muted text-xs">
                {phase.startSeconds}s - {phase.endSeconds}s
              </p>

              {phase.targetBeanTempStart && phase.targetBeanTempEnd && (
                <p className="text-accent-amber text-xs mt-2">
                  {phase.targetBeanTempStart}°C → {phase.targetBeanTempEnd}°C
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
