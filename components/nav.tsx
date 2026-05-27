"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, TrendingUp, Salad, Timer, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/workout", label: "Workout", Icon: ListChecks },
  { href: "/programs", label: "Programs", Icon: Dumbbell },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
  { href: "/nutrition", label: "Nutrition", Icon: Salad },
  { href: "/timer", label: "Rest timer", Icon: Timer },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: horizontal bar inside the card */}
      <nav className="hidden sm:flex gap-1 px-3 py-2 bg-app border-b border-app">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors",
                active
                  ? "bg-app2 border border-app2 text-app font-medium"
                  : "text-muted hover:bg-app2",
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile: fixed bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-app border-t border-app flex z-50 safe-area-pb">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors",
                active ? "text-accent" : "text-muted",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
