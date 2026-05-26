import { redirect } from "next/navigation";
import { WorkoutClient } from "@/components/workout-client";
import { ensureUserHasProgram } from "@/lib/actions/programs";
import { getTodayKey } from "@/lib/program";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function WorkoutPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const program = await ensureUserHasProgram(user.id);

  if (!program) {
    return null;
  }

  return <WorkoutClient program={program} defaultDay={getTodayKey()} />;
}
