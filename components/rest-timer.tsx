"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "60s", secs: 60 },
  { label: "90s", secs: 90 },
  { label: "2min", secs: 120 },
  { label: "3min", secs: 180 },
];

const CIRC = 2 * Math.PI * 116; // r=116 -> ~728.8

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

export function RestTimer() {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);
  const [customMin, setCustomMin] = useState("1");
  const [customSec, setCustomSec] = useState("30");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const start = useCallback(() => {
    if (running || remaining <= 0) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearTimer();
          setRunning(false);
          // Add a tiny delay to reset automatically like the HTML script did
          setTimeout(() => {
            setRemaining(duration);
          }, 2000);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, [running, remaining, duration]);

  const pause = useCallback(() => {
    clearTimer();
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setRunning(false);
    setRemaining(duration);
  }, [duration]);

  const addTime = (secs: number) => {
    setRemaining((r) => {
      const newVal = Math.min(r + secs, 599); // Max ~10 mins visually
      setDuration((d) => Math.max(d, newVal));
      return newVal;
    });
  };

  const pickPreset = (secs: number) => {
    clearTimer();
    setRunning(false);
    setDuration(secs);
    setRemaining(secs);
  };

  const applyCustom = () => {
    const m = parseInt(customMin) || 0;
    const s = parseInt(customSec) || 0;
    const total = m * 60 + s;
    if (total > 0) pickPreset(total);
  };

  useEffect(() => () => clearTimer(), []);

  const progress = duration > 0 ? remaining / duration : 0;
  const offset = CIRC * (1 - progress);
  const done = remaining === 0;
  const isDanger = remaining > 0 && remaining <= 10;

  return (
    <div className="w-full max-w-105 mx-auto">
      {/* Header */}
      {/* <div className="flex items-center justify-between mb-7">
        <div className="font-mono text-[11px] font-semibold tracking-[0.15em] text-muted uppercase">
          Rest Timer // <span className="text-accent">Overlift</span>
        </div>
        <div 
          className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(202,255,0,0.4)]"
          style={{ animation: running ? 'pulse 0.6s ease-in-out infinite' : 'pulse 1.5s ease-in-out infinite' }}
        />
      </div> */}

      {/* Presets */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {PRESETS.map((p) => {
          const isActive =
            duration === p.secs && !running && remaining === p.secs;
          return (
            <button
              key={p.secs}
              onClick={() => pickPreset(p.secs)}
              className={cn(
                "bg-app2 border outline-none font-play text-sm font-bold tracking-wider py-1.5 px-2 rounded-lg cursor-pointer transition-all uppercase",
                isActive
                  ? "bg-accent/15 border-accent text-accent shadow-[0_0_12px_rgba(202,255,0,0.4)]"
                  : "border-app text-muted hover:border-accent hover:text-accent hover:bg-accent/15",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Timer Ring */}
      <div className="relative flex items-center justify-center mb-8">
        <svg className="w-65 h-65 -rotate-90" viewBox="0 0 260 260">
          <circle
            className="fill-none stroke-app3 stroke-[6px]"
            cx="130"
            cy="130"
            r="116"
          />
          <circle
            className={cn(
              "fill-none stroke-[6px] stroke-linecap-round [transition:stroke-dashoffset_1s_linear,stroke_0.3s_ease]",
              isDanger
                ? "stroke-[#ff4444] drop-shadow-[0_0_6px_rgba(255,68,68,0.5)]"
                : "stroke-accent drop-shadow-[0_0_6px_rgba(202,255,0,0.4)]",
            )}
            cx="130"
            cy="130"
            r="116"
            strokeDasharray={CIRC}
            strokeDashoffset={
              running || remaining !== duration ? offset : offset
            }
            // Add style for stroke offset so it updates smoothly
            style={{ strokeDashoffset: offset }}
          />
        </svg>
        <div className="absolute text-center">
          <div
            className={cn(
              "font-play text-[72px] font-black leading-none tracking-[-2px] transition-colors",
              isDanger ? "text-[#ff4444]" : "text-app",
            )}
          >
            {done ? "0:00" : formatTime(remaining)}
          </div>
          <div className="text-[11px] font-semibold tracking-[0.15em] text-muted uppercase mt-1">
            {done
              ? "Done! 💪"
              : running
                ? "Resting..."
                : remaining < duration && !running
                  ? "Paused"
                  : "Ready"}
          </div>
        </div>
      </div>

      {/* Custom Input */}
      <div className="flex items-center gap-2 mb-2 bg-app2 border border-app rounded-[10px] py-2.5 px-3.5">
        <div className="text-[11px] font-semibold tracking-widest text-muted uppercase flex-1">
          Custom
        </div>
        <div className="flex items-center gap-1">
          <input
            className="bg-app3 border border-app text-app font-play text-[18px] font-bold w-13 text-center py-1.5 px-1 rounded-md outline-none transition-colors focus:border-accent"
            type="number"
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            min="0"
            max="99"
            placeholder="mm"
          />
          <span className="font-play text-[18px] font-bold text-muted">:</span>
          <input
            className="bg-app3 border border-app text-app font-play text-[18px] font-bold w-13 text-center py-1.5 px-1 rounded-md outline-none transition-colors focus:border-accent"
            type="number"
            value={customSec}
            onChange={(e) => setCustomSec(e.target.value)}
            min="0"
            max="59"
            placeholder="ss"
          />
          <button
            className="bg-accent text-black font-play text-[13px] font-extrabold tracking-[0.08em] py-2 px-3.5 rounded-md outline-none cursor-pointer uppercase ml-1 transition-opacity hover:opacity-80"
            onClick={applyCustom}
          >
            Set
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-2.5">
        {!running ? (
          <button
            onClick={start}
            className="col-span-2 flex items-center justify-center gap-2 bg-accent text-black p-2 rounded-xl font-play text-lg font-semibold tracking-normal uppercase cursor-pointer border-none transition-all hover:bg-[#d4ff00] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(202,255,0,0.4)] active:translate-y-0"
          >
            <Play fill="currentColor" stroke="none" size={20} /> Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="col-span-2 flex items-center justify-center gap-2 bg-app2 text-app p-2 rounded-xl border border-app font-play text-lg font-semibold tracking-normal uppercase outline-none cursor-pointer transition-all hover:border-accent hover:text-accent"
          >
            <Pause fill="currentColor" stroke="none" size={20} /> Pause
          </button>
        )}
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 bg-app2 text-muted p-3 rounded-xl border border-app font-play text-sm font-extrabold tracking-widest uppercase outline-none cursor-pointer transition-all active:border-[#ff4444] active:text-[#ff4444]"
        >
          <RotateCcw strokeWidth={3} size={14} /> Reset
        </button>
        <button
          onClick={() => addTime(15)}
          className="flex items-center justify-center gap-1 bg-app2 text-muted p-3 rounded-xl border border-app font-play text-sm font-extrabold tracking-widest uppercase outline-none cursor-pointer transition-all hover:border-accent hover:text-accent"
        >
          <Plus strokeWidth={4} size={14} /> 15s
        </button>
      </div>
    </div>
  );
}
