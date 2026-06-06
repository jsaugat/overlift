import { getMuscleClass } from "@/lib/muscle-utils";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

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
    <Badge className={cn("uppercase", getMuscleClass(label), className)}>
      {label}
    </Badge>
  );
}
