'use client'

interface MacroBarsProps {
  protein: number
  carbs: number
  fat: number
  proteinPct: number
  carbsPct: number
  fatPct: number
}

interface BarProps {
  label: string
  value: string
  pct: number
  color: string
}

function Bar({ label, value, pct, color }: BarProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-muted mb-1.5">
        <span>{label}</span>
        <span className="font-medium text-app">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-app3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

export function MacroBars({ protein, carbs, fat, proteinPct, carbsPct, fatPct }: MacroBarsProps) {
  return (
    <div>
      <Bar label="Protein" value={`${protein}g`} pct={proteinPct} color="rgb(var(--blue))" />
      <Bar label="Carbs"   value={`${carbs}g`}   pct={carbsPct}   color="rgb(var(--green))" />
      <Bar label="Fats"    value={`${fat}g`}      pct={fatPct}     color="rgb(var(--amber))" />
    </div>
  )
}
