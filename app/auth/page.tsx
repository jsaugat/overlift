"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/workout";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = getSupabase();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setMessage("Magic link sent. Check your email and open the link on this device.");
    setLoading(false);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-app border border-app rounded-xl p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-accent mb-2">Overlift</p>
        <h1 className="text-2xl font-semibold text-app mb-2">Sign in</h1>
        <p className="text-sm text-muted mb-5">Use your email to receive a magic sign-in link.</p>

        <form onSubmit={handleMagicLink} className="space-y-3">
          <div>
            <label htmlFor="email" className="text-xs text-muted block mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-app2 bg-app2 text-app"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-sm rounded-lg border border-app2 text-app hover:bg-app2 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {message && <p className="text-xs text-pull mt-4">{message}</p>}
        {error && <p className="text-xs text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
}
