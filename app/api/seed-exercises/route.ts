import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  isExerciseLibrarySeeded,
  seedExerciseLibrary,
} from "@/lib/actions/exercise-library";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const seeded = await isExerciseLibrarySeeded();
    if (seeded) {
      const { count, error: countError } = await supabase
        .from("exercises")
        .select("id", { count: "exact", head: true })
        .eq("source", "exercisedb");

      if (countError) {
        return NextResponse.json(
          { message: "Failed to check count" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { message: "Already seeded", count: count ?? 0 },
        { status: 200 },
      );
    }

    const { inserted, skipped } = await seedExerciseLibrary();
    return NextResponse.json(
      { message: "Seeded", inserted, skipped },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to seed exercises", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
