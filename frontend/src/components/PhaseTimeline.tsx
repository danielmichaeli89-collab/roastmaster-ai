import React from 'react'
import { ProfilePhase } from '../types'

interface PhaseTimelineProps {
  phases: ProfilePhase[]
  currentTime: number
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({ phases, currentTime }) => {
  const maxTime = Math.max(...phases.map((p) => p.endSeconds), currentTime)

  return (
    <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-4">
      <h3 className="text-amber-500 font-semibold mb-4">Roast Progress</h3>

      {/* Timeline visualization */}
      <div className="relative h-12 bg-espresso-800 rounded-full overflow-hidden mb-4">
        {/* Current progress indicator */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
          style={{ width: `${(currentTime / maxTime) * 100}%` }}
        />

        {/* Phase markers */}
        <div className="absolute inset-0 flex items-center px-2">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className="absolute h-full flex items-center"
              style={{
                left: `${(phase.startSeconds / maxTime) * 100}%`,
              }}
            >
              <div className="w-1 h-full bg-espresso-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Phase list */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {phases.map((phase) => {
          const isActive = currentTime >= phase.startSeconds && currentTime < phase.endSeconds
          const isComplete = currentTime >= phase.endSeconds

          return (
            <div
              key={phase.id}
              className={`p-2 rounded border text-xs ${
                isActive
                  ? 'bg-amber-900/50 border-amber-500'
                  : isComplete
                    ? 'bg-success-900/30 border-success-500'
                    : 'bg-espresso-800 border-espresso-700'
              }`}
            >
              <p className="font-semibold text-espresso-100">{phase.phaseName}</p>
              <p className="text-espresso-400">
                {phase.startSeconds}s - {phase.endSeconds}s
              </p>
              {isActive && <p className="text-amber-400 font-bold mt-1">●</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
