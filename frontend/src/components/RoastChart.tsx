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
  includeLines = ['bt1', 'bt2', 'drum'],
}) => {
  const chartData = data.map((log) => ({
    time: log.elapsedSeconds,
    bt1: log.beanTemperature1,
    bt2: log.beanTemperature2,
    btAvg: log.beanTemperatureAvg,
    air: log.airTemperature,
    inlet: log.inletTemperature,
    drum: log.drumTemperature,
    exhaust: log.exhaustTemperature,
  }))

  const lineConfig: Record<string, { stroke: string; name: string }> = {
    bt1: { stroke: '#f59e0b', name: 'Bean Temp 1' },
    bt2: { stroke: '#d97706', name: 'Bean Temp 2' },
    btAvg: { stroke: '#fbbf24', name: 'Bean Avg' },
    air: { stroke: '#60a5fa', name: 'Air Temp' },
    inlet: { stroke: '#3b82f6', name: 'Inlet Temp' },
    drum: { stroke: '#ef4444', name: 'Drum Temp' },
    exhaust: { stroke: '#f87171', name: 'Exhaust Temp' },
    ror: { stroke: '#10b981', name: 'Rate of Rise' },
  }

  return (
    <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
      {title && <h3 className="text-lg font-semibold text-amber-500 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
          <XAxis
            dataKey="time"
            label={{ value: 'Time (seconds)', position: 'insideBottomRight', offset: -5 }}
            stroke="#666"
          />
          <YAxis
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
            stroke="#666"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1c1c1c',
              border: '1px solid #d2691e',
              borderRadius: '6px',
            }}
            labelStyle={{ color: '#fbbf24' }}
          />
          <Legend />
          {includeLines.includes('bt1') && <Line type="monotone" dataKey="bt1" {...lineConfig.bt1} isAnimationActive={false} />}
          {includeLines.includes('bt2') && <Line type="monotone" dataKey="bt2" {...lineConfig.bt2} isAnimationActive={false} />}
          {includeLines.includes('air') && <Line type="monotone" dataKey="air" {...lineConfig.air} isAnimationActive={false} />}
          {includeLines.includes('drum') && <Line type="monotone" dataKey="drum" {...lineConfig.drum} isAnimationActive={false} />}
          {includeLines.includes('exhaust') && <Line type="monotone" dataKey="exhaust" {...lineConfig.exhaust} isAnimationActive={false} />}
          {includeLines.includes('inlet') && <Line type="monotone" dataKey="inlet" {...lineConfig.inlet} isAnimationActive={false} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
