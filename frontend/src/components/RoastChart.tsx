import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { TemperatureLog } from '../types'

interface RoastChartProps {
  data: TemperatureLog[]
  height?: number
  title?: string
  includeLines?: ('bt1' | 'bt2' | 'air' | 'drum' | 'exhaust' | 'inlet' | 'ror')[]
}

export const RoastChart: React.FC<RoastChartProps> = ({
  data,
  height = 400,
  title = 'Roast Curve',
  includeLines = ['bt1', 'bt2', 'air'],
}) => {
  const chartData = data.map((log) => ({
    time: log.elapsedSeconds,
    timeLabel: `${Math.floor(log.elapsedSeconds / 60)}:${String(log.elapsedSeconds % 60).padStart(2, '0')}`,
    bt1: log.beanTemperature1,
    bt2: log.beanTemperature2,
    btAvg: log.beanTemperatureAvg,
    air: log.airTemperature,
    inlet: log.inletTemperature,
    drum: log.drumTemperature,
    exhaust: log.exhaustTemperature,
  }))

  const lineConfig: Record<string, { stroke: string; name: string; strokeWidth: number }> = {
    bt1: { stroke: '#f59e0b', name: 'Bean Temp 1', strokeWidth: 2.5 },
    bt2: { stroke: '#d97706', name: 'Bean Temp 2', strokeWidth: 2.5 },
    btAvg: { stroke: '#fbbf24', name: 'Bean Avg', strokeWidth: 2 },
    air: { stroke: '#3b82f6', name: 'Air Temp', strokeWidth: 2 },
    inlet: { stroke: '#06b6d4', name: 'Inlet Temp', strokeWidth: 1.5 },
    drum: { stroke: '#8b5a3c', name: 'Drum Temp', strokeWidth: 1.5 },
    exhaust: { stroke: '#f87171', name: 'Exhaust Temp', strokeWidth: 1.5 },
    ror: { stroke: '#22c55e', name: 'Rate of Rise', strokeWidth: 2 },
  }

  return (
    <div className="glass-card border border-accent-amber border-opacity-10 rounded-xl p-8 w-full">
      {title && (
        <h3 className="text-xl font-bold text-text-primary mb-6">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 40 }}>
          <defs>
            <linearGradient id="colorBt1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.08)"
            vertical={false}
          />
          <XAxis
            dataKey="timeLabel"
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
            tick={{ fill: 'rgba(255,255,255,0.5)' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
            tick={{ fill: 'rgba(255,255,255,0.5)' }}
            label={{
              value: 'Temperature (°C)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'rgba(255,255,255,0.5)', fontSize: '12px' },
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
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px',
            }}
          />
          {/* Reference lines for key temperatures */}
          <ReferenceLine
            y={170}
            stroke="rgba(34, 197, 94, 0.2)"
            strokeDasharray="5 5"
            label={{
              value: 'Yellowing (~170°C)',
              position: 'left',
              fill: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
            }}
          />
          <ReferenceLine
            y={200}
            stroke="rgba(245, 158, 11, 0.2)"
            strokeDasharray="5 5"
            label={{
              value: 'First Crack (~200°C)',
              position: 'left',
              fill: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
            }}
          />
          {/* Render selected lines */}
          {includeLines.includes('bt1') && (
            <Line
              type="monotone"
              dataKey="bt1"
              stroke={lineConfig.bt1.stroke}
              strokeWidth={lineConfig.bt1.strokeWidth}
              name={lineConfig.bt1.name}
              isAnimationActive={false}
              dot={false}
              connectNulls
            />
          )}
          {includeLines.includes('bt2') && (
            <Line
              type="monotone"
              dataKey="bt2"
              stroke={lineConfig.bt2.stroke}
              strokeWidth={lineConfig.bt2.strokeWidth}
              name={lineConfig.bt2.name}
              isAnimationActive={false}
              dot={false}
              connectNulls
            />
          )}
          {includeLines.includes('air') && (
            <Line
              type="monotone"
              dataKey="air"
              stroke={lineConfig.air.stroke}
              strokeWidth={lineConfig.air.strokeWidth}
              name={lineConfig.air.name}
              isAnimationActive={false}
              dot={false}
              connectNulls
            />
          )}
          {includeLines.includes('drum') && (
            <Line
              type="monotone"
              dataKey="drum"
              stroke={lineConfig.drum.stroke}
              strokeWidth={lineConfig.drum.strokeWidth}
              name={lineConfig.drum.name}
              isAnimationActive={false}
              dot={false}
              connectNulls
              strokeDasharray="5 5"
            />
          )}
          {includeLines.includes('exhaust') && (
            <Line
              type="monotone"
              dataKey="exhaust"
              stroke={lineConfig.exhaust.stroke}
              strokeWidth={lineConfig.exhaust.strokeWidth}
              name={lineConfig.exhaust.name}
              isAnimationActive={false}
              dot={false}
              connectNulls
              strokeDasharray="5 5"
            />
          )}
          {includeLines.includes('inlet') && (
            <Line
              type="monotone"
              dataKey="inlet"
              stroke={lineConfig.inlet.stroke}
              strokeWidth={lineConfig.inlet.strokeWidth}
              name={lineConfig.inlet.name}
              isAnimationActive={false}
              dot={false}
              connectNulls
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
