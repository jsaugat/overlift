"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

const grindQuotes = [
  ["JUST FUCKING", "LIFT"],
  ["BREAK THE", "LIMITS"],
  ["FUCK THE", "RECORDS"],
  ["PROGRESSIVE", "OVERLOAD"],
];

interface AppHeaderProps {
  dayType?: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function AppHeader({ dayType }: AppHeaderProps) {
  const dayName = DAY_NAMES[new Date().getDay()];
  const dayTypeLabel = (dayType ?? "rest").toUpperCase();
  const pathname = usePathname();
  const router = useRouter();
  const [randomQuote, setRandomQuote] = useState(grindQuotes[0]);
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const picked = grindQuotes[Math.floor(Math.random() * grindQuotes.length)];
    setRandomQuote(picked);

    const supabase = getSupabase();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
    setSigningOut(false);
  }

  return (
    <div
      className={cn(
        "mb-12",
        pathname === "/workout" ? "block" : "hidden md:block",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-accent mb-1.5">
            OVERLIFT // SYSTEM
          </div>
          <h1 className="font-bebas text-[clamp(52px,12vw,110px)] leading-[0.88] tracking-[0.02em] uppercase">
            {randomQuote[0]}{" "}
            <span className="text-accent block">{randomQuote[1]}</span>
          </h1>
        </div>

        {email && (
          <div className="text-right pt-1">
            <div className="text-[10px] text-muted font-mono truncate max-w-40">
              {email}
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-[11px] text-app hover:text-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-5 mt-5 flex-wrap">
        <div className="flex items-center gap-1.75 text-[11px] text-muted font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
          {dayName.toUpperCase()}
        </div>
        <div className="flex items-center gap-1.75 text-[11px] text-muted font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></div>
          {dayTypeLabel}
        </div>
      </div>
    </div>
  );
}
