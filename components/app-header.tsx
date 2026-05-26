"use client";

import { useEffect, useState } from "react"; // 1. Added hook imports
import { getDayName, getTodayKey, getProgramDay } from "@/lib/program";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const grindQuotes = [
  ["JUST FUCKING", "LIFT"],
  ["BREAK THE", "LIMITS"],
  ["FUCK THE", "RECORDS"],
  ["PROGRESSIVE", "OVERLOAD"],
];

export function AppHeader() {
  const todayKey = getTodayKey();
  const day = getProgramDay(todayKey);
  const dayName = getDayName();
  const pathname = usePathname();

  // 2. Default state to the first quote so there's always a safe fallback for SSR
  const [randomQuote, setRandomQuote] = useState(grindQuotes[0]);

  // 3. Randomize only ONCE when the component mounts in the browser
  useEffect(() => {
    const picked = grindQuotes[Math.floor(Math.random() * grindQuotes.length)];
    setRandomQuote(picked);
  }, []);

  return (
    <div
      className={cn(
        "mb-12",
        pathname === "/workout" ? "block" : "hidden md:block",
      )}
    >
      <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-accent mb-1.5">
        OVERLIFT // SYSTEM
      </div>
      <h1 className="font-bebas text-[clamp(52px,12vw,110px)] leading-[0.88] tracking-[0.02em] uppercase">
        {randomQuote[0]}{" "}
        <span className="text-accent block">{randomQuote[1]}</span>
      </h1>

      <div className="flex gap-5 mt-5 flex-wrap">
        <div className="flex items-center gap-1.75 text-[11px] text-muted font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
          {dayName.toUpperCase()}
        </div>
        <div className="flex items-center gap-1.75 text-[11px] text-muted font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
          {day.type.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
