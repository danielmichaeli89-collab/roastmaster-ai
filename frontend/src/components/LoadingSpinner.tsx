import React from 'react'
import { Coffee } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-screen">
      <div className={`${sizeClasses[size]} mb-6 text-accent-amber animate-pulse-glow`}>
        <Coffee className={`${sizeClasses[size]} animate-spin`} style={{ animationDuration: '2s' }} />
      </div>
      {message && (
        <p className="mt-4 text-text-muted text-sm font-medium">{message}</p>
      )}
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  )
}
