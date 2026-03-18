import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} border-4 border-espresso-700 border-t-amber-500 rounded-full animate-spin`}
      />
      {message && (
        <p className="mt-4 text-espresso-300 text-sm">{message}</p>
      )}
    </div>
  )
}
