import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-espresso-900 border border-espresso-800 rounded-lg p-6 transition-all ${
        onClick ? 'cursor-pointer hover:border-amber-500 hover:shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-espresso-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-amber-500 mt-2">{value}</p>
          {subtitle && (
            <p className="text-espresso-400 text-xs mt-2">{subtitle}</p>
          )}
        </div>
        <div className="text-amber-500 opacity-30">
          <Icon size={32} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center">
          <span
            className={`text-sm font-semibold ${
              trend.isPositive ? 'text-success-500' : 'text-error-500'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-espresso-400 text-xs ml-2">from last period</span>
        </div>
      )}
    </div>
  )
}
