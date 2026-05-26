"use client";

import { useState, useEffect, useCallback } from "react";
import { AppHeader } from "@/components/app-header";
import { Nav } from "@/components/nav";
import { WeightChart } from "@/components/weight-chart";
import { supabase } from "@/lib/supabase";
import type { WeightLog } from "@/types/db";
import { Info } from "lucide-react";

export default function ProgressPage() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("weight_logs")
      .select("*")
      .order("log_date", { ascending: true });
    setLogs(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logWeight = async () => {
    const val = parseFloat(input);
    if (isNaN(val) || val < 30 || val > 200) return;
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    await supabase
      .from("weight_logs")
      .upsert({ log_date: today, weight_kg: val } as any, {
        onConflict: "log_date",
      });
    setInput("");
    await fetchLogs();
    setSaving(false);
  };

  const current = logs.length ? logs[logs.length - 1].weight_kg : null;
  const startWeight = 70;
  const change = current !== null ? (current - startWeight).toFixed(1) : null;

  const MetricCard = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-app2 rounded-xl px-4 py-3">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className="text-xl font-medium text-app">{value}</div>
    </div>
  );

  return (
    <>
      <AppHeader />
      <div className="bg-app border border-app rounded-xl mt-2 overflow-hidden">
        <Nav />
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-base font-medium text-app">Progress tracker</h2>
            <p className="text-sm text-muted mt-0.5">
              Log your bodyweight weekly to track your lean bulk.
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MetricCard label="Starting weight" value="70 kg" />
            <MetricCard
              label="Current weight"
              value={current !== null ? `${current} kg` : "—"}
            />
            <MetricCard
              label="Change"
              value={
                change !== null
                  ? `${parseFloat(change) >= 0 ? "+" : ""}${change} kg`
                  : "—"
              }
            />
            <MetricCard label="Entries logged" value={`${logs.length}`} />
          </div>

          {/* Log weight */}
          <div className="bg-app border border-app rounded-xl p-4">
            <div className="text-sm font-medium text-app mb-3">
              Log today's weight
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="70.0"
                step="0.1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && logWeight()}
                className="w-28 px-3 py-1.5 text-sm rounded-lg border border-app2 bg-app2 text-app"
              />
              <span className="text-sm text-muted">kg</span>
              <button
                onClick={logWeight}
                disabled={saving}
                className="px-4 py-1.5 text-sm rounded-lg border border-app2 text-app hover:bg-app2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving…" : "Log"}
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-app border border-app rounded-xl p-4">
            <div className="text-sm font-medium text-app mb-3">
              Weight history
            </div>
            {loading ? (
              <div className="h-44 flex items-center justify-center text-sm text-muted">
                Loading…
              </div>
            ) : (
              <WeightChart logs={logs} />
            )}
          </div>

          {/* Recent logs */}
          <div className="bg-app border border-app rounded-xl p-4">
            <div className="text-sm font-medium text-app mb-3">Recent logs</div>
            {logs.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">
                No entries yet. Log your first weigh-in above.
              </p>
            ) : (
              <div className="divide-y divide-app">
                {[...logs]
                  .reverse()
                  .slice(0, 8)
                  .map((l) => (
                    <div
                      key={l.id}
                      className="flex justify-between py-2 text-sm"
                    >
                      <span className="text-muted text-xs">
                        {new Date(l.log_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <span className="text-app">{l.weight_kg} kg</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Lean bulk tip */}
          <div className="rounded-xl p-4 border-l-2 border-accent bg-accent/4">
            <div className="flex items-center gap-1.5 text-accent text-xs font-medium mb-1">
              <Info size={13} /> Lean bulk targets
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Aim for <strong className="text-app">+0.25–0.5 kg/month</strong>{" "}
              weight gain. Gaining faster → reduce calories by ~100. Too slow
              after 3 weeks → add ~100 cals.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
