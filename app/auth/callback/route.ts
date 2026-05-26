import { type NextRequest, NextResponse } from "next/server";
import { ensureUserHasProgram } from "@/lib/actions/programs";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/workout";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      try {
        await ensureUserHasProgram(user.id);
      } catch (error) {
        console.error("Failed to ensure user program", error);
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
