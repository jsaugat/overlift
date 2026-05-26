import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/db";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabase() {
  if (!client) {
    client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return client;
}

export const supabase = getSupabase();
