/**
 * Returns the CSS class name for a given muscle group.
 * These map to the badge-* utility classes defined in globals.css.
 */
export function getMuscleClass(muscle: string | null | undefined): string {
  if (!muscle) return "badge-generic";
  const m = muscle.toLowerCase();
  if (m.includes("chest")) return "badge-chest";
  if (m.includes("shoulder") || m.includes("delt")) return "badge-shoulders";
  if (m.includes("back") || m.includes("lat")) return "badge-back";
  if (m.includes("bicep")) return "badge-biceps";
  if (m.includes("tricep")) return "badge-triceps";
  if (m.includes("quad")) return "badge-quads";
  if (m.includes("hamstring") || m.includes("glute")) return "badge-hamstrings";
  if (m.includes("calv")) return "badge-calves";
  if (m.includes("core") || m.includes("ab")) return "badge-core";
  return "badge-generic";
}
