import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  gradient?: boolean
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  unit,
  subtitle,
  trend,
  gradient = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${
        gradient ? 'hover:bg-opacity-100' : ''
      } p-6 rounded-xl border border-accent-amber border-opacity-10 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-elevation hover:border-opacity-20' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 rounded-lg bg-accent-amber bg-opacity-10">
          <div className="text-accent-amber">{icon}</div>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
              trend.isPositive
                ? 'bg-success bg-opacity-10 text-success'
                : 'bg-danger bg-opacity-10 text-danger'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-text-muted text-sm font-medium">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-text-primary">{value}</p>
          {unit && <p className="text-text-muted text-sm">{unit}</p>}
        </div>
        {subtitle && (
          <p className="text-text-muted text-xs pt-2">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
