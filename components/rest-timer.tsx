'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRESETS = [
  { label: '60s',   secs: 60 },
  { label: '90s',   secs: 90 },
  { label: '2 min', secs: 120 },
  { label: '3 min', secs: 180 },
]

const CIRC = 2 * Math.PI * 52 // r=52

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec < 10 ? '0' : ''}${sec}`
}

export function RestTimer() {
  const [duration, setDuration] = useState(90)
  const [remaining, setRemaining] = useState(90)
  const [running, setRunning] = useState(false)
  const [customMin, setCustomMin] = useState('')
  const [customSec, setCustomSec] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const start = useCallback(() => {
    if (running || remaining <= 0) return
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearTimer()
          setRunning(false)
          return 0
        }
        return r - 1
      })
    }, 1000)
  }, [running, remaining])

  const pause = useCallback(() => {
    clearTimer()
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setRunning(false)
    setRemaining(duration)
  }, [duration])

  const pickPreset = (secs: number) => {
    clearTimer()
    setRunning(false)
    setDuration(secs)
    setRemaining(secs)
  }

  const applyCustom = () => {
    const m = parseInt(customMin) || 0
    const s = parseInt(customSec) || 0
    const total = m * 60 + s
    if (total > 0) pickPreset(total)
  }

  useEffect(() => () => clearTimer(), [])

  const progress = duration > 0 ? remaining / duration : 0
  const offset = CIRC * (1 - progress)
  const done = remaining === 0
  const strokeColor = done ? '#E24B4A' : remaining <= 10 ? '#E24B4A' : '#185FA5'

  return (
    <div className="bg-app border border-app rounded-xl p-5 text-center">
      {/* Presets */}
      <p className="text-xs text-muted mb-3">Presets</p>
      <div className="flex gap-2 justify-center flex-wrap mb-1">
        {PRESETS.map((p) => (
          <button
            key={p.secs}
            onClick={() => pickPreset(p.secs)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg border text-[12px] transition-colors cursor-pointer',
              duration === p.secs
                ? 'badge-push border-accent text-accent'
                : 'border-app2 text-muted hover:bg-app2'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-faint mb-5">
        Compound lifts: 2–3 min &nbsp;·&nbsp; Isolation: 60–90s
      </p>

      {/* Ring */}
      <svg
        viewBox="0 0 120 120"
        width={130}
        height={130}
        className="block mx-auto"
        aria-label="Rest timer"
      >
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(var(--bg3))" strokeWidth="6" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>

      {/* Display */}
      <div className="text-5xl font-medium tracking-widest text-app mt-1 mb-4" aria-live="polite">
        {done ? 'Done!' : formatTime(remaining)}
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center mb-5">
        <button
          onClick={start}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-app2 text-sm text-app hover:bg-app2 transition-colors cursor-pointer"
        >
          <Play size={14} /> Start
        </button>
        <button
          onClick={pause}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-app2 text-sm text-app hover:bg-app2 transition-colors cursor-pointer"
        >
          <Pause size={14} /> Pause
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-app2 text-sm text-app hover:bg-app2 transition-colors cursor-pointer"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Custom */}
      <div className="flex items-center gap-2 justify-center">
        <input
          type="number"
          placeholder="min"
          min={0}
          max={10}
          value={customMin}
          onChange={(e) => setCustomMin(e.target.value)}
          className="w-16 py-1.5 text-center text-sm rounded-lg border border-app2 bg-app2 text-app"
        />
        <span className="text-muted text-sm">:</span>
        <input
          type="number"
          placeholder="sec"
          min={0}
          max={59}
          value={customSec}
          onChange={(e) => setCustomSec(e.target.value)}
          className="w-16 py-1.5 text-center text-sm rounded-lg border border-app2 bg-app2 text-app"
        />
        <button
          onClick={applyCustom}
          className="px-3 py-1.5 text-sm rounded-lg border border-app2 text-muted hover:bg-app2 transition-colors cursor-pointer"
        >
          Set
        </button>
      </div>
    </div>
  )
}
