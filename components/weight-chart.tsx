'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import type { WeightLog } from '@/types/db'

interface WeightChartProps {
  logs: WeightLog[]
}

export function WeightChart({ logs }: WeightChartProps) {
  if (!logs.length) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-muted">
        No data yet. Log your first weight above.
      </div>
    )
  }

  const data = logs.map((l) => ({
    date: new Date(l.log_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    weight: Number(l.weight_kg),
  }))

  const min = Math.min(...data.map((d) => d.weight)) - 0.5
  const max = Math.max(...data.map((d) => d.weight)) + 0.5

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#185FA5" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#185FA5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'rgb(107 107 103)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[min, max]}
            tick={{ fontSize: 11, fill: 'rgb(107 107 103)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgb(var(--bg))',
              border: '1px solid rgb(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(v: number) => [`${v} kg`, 'Weight']}
          />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#185FA5"
            strokeWidth={2}
            fill="url(#weightGrad)"
            dot={{ r: 3, fill: '#185FA5', strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
