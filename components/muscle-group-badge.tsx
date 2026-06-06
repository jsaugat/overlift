import { getMuscleClass } from "@/lib/muscle-utils";
import { cn } from "@/lib/utils";

interface MuscleGroupBadgeProps {
  muscle: string | null | undefined;
  className?: string;
  fallback?: string;
}

export function MuscleGroupBadge({
  muscle,
  className,
  fallback = "General",
}: MuscleGroupBadgeProps) {
  const label = muscle?.trim() || fallback;
  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-[3px] text-[0.65rem] font-bold uppercase tracking-wide",
        getMuscleClass(label),
        className,
      )}
    >
      {label}
    </span>
  );
}
