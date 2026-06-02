import { redirect } from "next/navigation";
import { WorkoutClient } from "@/components/workout-client";
import { ensureUserHasProgram } from "@/lib/actions/programs";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function WorkoutPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const activeProgram = await ensureUserHasProgram(user.id);

  if (!activeProgram) {
    return null;
  }

  const today = new Date().getDay(); // 0-6
  const offset = (today - (activeProgram.starting_day ?? 0) + 7) % 7;
  const todayDayOrder = offset + 1;

  const initialDayOrder = activeProgram.days.some((d) => d.day_order === todayDayOrder)
    ? todayDayOrder
    : (activeProgram.days[0]?.day_order ?? 1);

  return (
    <WorkoutClient
      program={activeProgram}
      defaultDayOrder={initialDayOrder}
    />
  );
}
