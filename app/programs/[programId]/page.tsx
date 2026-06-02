import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Nav } from "@/components/nav";
import { ProgramDetailClient } from "@/components/program-detail-client";
import { getProgramWithExercises } from "@/lib/actions/programs";
import { getExerciseLibrary } from "@/lib/actions/exercise-library";
import { createSupabaseServerClient } from "@/lib/supabase-server";

interface ProgramDetailPageProps {
  params: Promise<{ programId: string }>;
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { programId } = await params;
  const parsedProgramId = Number(programId);

  if (!Number.isInteger(parsedProgramId) || parsedProgramId <= 0) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [program, exerciseLibrary] = await Promise.all([
    getProgramWithExercises(user.id, parsedProgramId),
    getExerciseLibrary(),
  ]);

  if (!program) {
    notFound();
  }

  return (
    <>
      <AppHeader />
      <div className="bg-app border border-app rounded-xl mt-2 overflow-hidden mb-12">
        <Nav />
        <div className="p-4 sm:p-6">
          <ProgramDetailClient
            userId={user.id}
            program={program}
            exerciseLibrary={exerciseLibrary}
          />
        </div>
      </div>
    </>
  );
}
