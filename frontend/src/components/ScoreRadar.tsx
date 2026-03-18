import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

interface ScoreRadarProps {
  data: {
    category: string
    score: number
  }[]
  height?: number
}

export const ScoreRadar: React.FC<ScoreRadarProps> = ({
  data,
  height = 300,
}) => {
  return (
    <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-amber-500 mb-4">Cupping Scores</h3>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          <PolarGrid strokeDasharray="3 3" stroke="#3d3d3d" />
          <PolarAngleAxis dataKey="category" stroke="#888" />
          <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="#888" />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#fbbf24"
            fill="#f59e0b"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
