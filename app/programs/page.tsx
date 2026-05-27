import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Nav } from "@/components/nav";
import { ProgramsClient } from "@/components/programs-client";
import { getUserPrograms } from "@/lib/actions/programs";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function ProgramsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const programs = await getUserPrograms(user.id);

  return (
    <>
      <AppHeader />
      <div className="bg-app border border-app rounded-xl mt-2 overflow-hidden mb-12">
        <Nav />
        <div className="p-4 sm:p-6">
          <ProgramsClient userId={user.id} programs={programs} />
        </div>
      </div>
    </>
  );
}
