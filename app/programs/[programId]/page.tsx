import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Nav } from "@/components/nav";
import { getUserPrograms } from "@/lib/actions/programs";
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

  const programs = await getUserPrograms(user.id);
  const program = programs.find((item) => item.id === parsedProgramId);

  if (!program) {
    notFound();
  }

  return (
    <>
      <AppHeader />
      <div className="bg-app border border-app rounded-xl mt-2 overflow-hidden mb-12">
        <Nav />
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bebas text-[28px] tracking-[0.04em] uppercase text-app">
                {program.name}
              </h2>
              <p className="text-xs text-muted mt-1">
                {program.days.length} day{program.days.length === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              href="/programs"
              className="px-3 py-1.5 text-xs rounded-lg border border-app2 text-app hover:bg-app2 transition-colors"
            >
              Back
            </Link>
          </div>

          <div className="rounded-xl border border-app p-3 space-y-2">
            {program.days.length === 0 ? (
              <p className="text-sm text-muted">
                No days found in this program.
              </p>
            ) : (
              program.days.map((day) => (
                <div
                  key={day.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-app2 px-3 py-2"
                >
                  <p className="text-sm text-app">
                    {day.name ?? `Day ${day.day_order}`}
                  </p>
                  <p className="text-xs text-muted uppercase">{day.day_type}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
