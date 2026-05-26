"use client";

import { useState, useEffect, useCallback } from "react";
import { AppHeader } from "@/components/app-header";
import { Nav } from "@/components/nav";
import { MacroBars } from "@/components/macro-bars";
import { calcMacros, type ActivityLevel } from "@/lib/nutrition";
import { supabase } from "@/lib/supabase";
import type { NutritionLog } from "@/types/db";
import { Leaf } from "lucide-react";

const ACTIVITY_OPTIONS: { label: string; value: ActivityLevel }[] = [
  { label: "Lightly active", value: 1.375 },
  { label: "Moderately active", value: 1.55 },
  { label: "Very active", value: 1.725 },
];

const SURPLUS_OPTIONS = [
  { label: "+200 cal", value: 200 },
  { label: "+250 cal", value: 250 },
  { label: "+300 cal", value: 300 },
];

const PROTEIN_FOODS = [
  "Eggs (6–8/day)",
  "Chicken / fish",
  "Dal (lentils)",
  "Paneer / chhurpi",
  "Dahi / Greek yogurt",
  "Soya chunks",
  "Milk / whey",
  "Chickpeas / rajma",
];

export default function NutritionPage() {
  const [activity, setActivity] = useState<ActivityLevel>(1.55);
  const [surplus, setSurplus] = useState(250);
  const [todayLog, setTodayLog] = useState<NutritionLog | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [logInput, setLogInput] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [saving, setSaving] = useState(false);

  const macros = calcMacros(activity, surplus);

  const fetchTodayLog = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    if (!user) {
      setTodayLog(null);
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle();
    setTodayLog(data);
  }, []);

  useEffect(() => {
    fetchTodayLog();
  }, [fetchTodayLog]);

  const saveNutrition = async () => {
    const cal = parseInt(logInput.calories);
    const prot = parseInt(logInput.protein);
    if (!cal || !prot || !userId) return;
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("nutrition_logs").upsert(
      {
        user_id: userId,
        log_date: today,
        calories: cal,
        protein_g: prot,
        carbs_g: parseInt(logInput.carbs) || null,
        fat_g: parseInt(logInput.fat) || null,
      } as any,
      { onConflict: "user_id,log_date" },
    );
    setLogInput({ calories: "", protein: "", carbs: "", fat: "" });
    await fetchTodayLog();
    setSaving(false);
  };

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
            <h2 className="text-base font-medium text-app">
              Nutrition targets
            </h2>
            <p className="text-sm text-muted mt-0.5">
              Based on 70 kg bodyweight, lean bulk (+{surplus} cal surplus).
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="Daily calories"
              value={`${macros.calories} kcal`}
            />
            <MetricCard label="Protein target" value={`${macros.protein} g`} />
            <MetricCard
              label="Maintenance est."
              value={`${macros.maintenance} kcal`}
            />
            <MetricCard label="Protein / kg" value="1.6 g/kg" />
          </div>

          {/* Personalise */}
          <div className="bg-app border border-app rounded-xl p-4">
            <div className="text-sm font-medium text-app mb-3">
              Personalise your targets
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1.5">
                  Activity level
                </label>
                <select
                  value={activity}
                  onChange={(e) =>
                    setActivity(parseFloat(e.target.value) as ActivityLevel)
                  }
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-app2 bg-app2 text-app"
                >
                  {ACTIVITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5">
                  Surplus
                </label>
                <select
                  value={surplus}
                  onChange={(e) => setSurplus(parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-app2 bg-app2 text-app"
                >
                  {SURPLUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Macro bars */}
          <div className="bg-app border border-app rounded-xl p-4">
            <div className="text-sm font-medium text-app mb-3">
              Macronutrient breakdown
            </div>
            <MacroBars {...macros} />
          </div>

          {/* Log today's nutrition */}
          <div className="bg-app border border-app rounded-xl p-4">
            <div className="text-sm font-medium text-app mb-1">
              Log today's nutrition
            </div>
            {todayLog && (
              <p className="text-xs text-pull mb-3">
                ✓ Logged today — {todayLog.calories} kcal, {todayLog.protein_g}g
                protein
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(["calories", "protein", "carbs", "fat"] as const).map(
                (field) => (
                  <div key={field}>
                    <label className="text-xs text-muted block mb-1 capitalize">
                      {field}
                    </label>
                    <input
                      type="number"
                      placeholder={field === "calories" ? "kcal" : "g"}
                      value={logInput[field]}
                      onChange={(e) =>
                        setLogInput((p) => ({ ...p, [field]: e.target.value }))
                      }
                      className="w-full px-2 py-1.5 text-sm rounded-lg border border-app2 bg-app2 text-app"
                    />
                  </div>
                ),
              )}
            </div>
            <button
              onClick={saveNutrition}
              disabled={saving}
              className="px-4 py-1.5 text-sm rounded-lg border border-app2 text-app hover:bg-app2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving…" : "Log nutrition"}
            </button>
          </div>

          {/* High-protein foods */}
          <div className="bg-app border border-app rounded-xl p-4">
            <div className="text-sm font-medium text-app mb-3">
              High-protein foods for Nepal
            </div>
            <div className="flex flex-wrap gap-2">
              {PROTEIN_FOODS.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-full border border-app bg-app2 text-muted"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Sleep reminder */}
          <div className="rounded-xl p-4 border-l-[2px] border-pull bg-pull/4">
            <div className="flex items-center gap-1.5 text-pull text-xs font-medium mb-1">
              <Leaf size={13} /> Sleep reminder
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Target <strong className="text-app">7–8 hours</strong> every
              night. Muscle grows during sleep — prioritise it as much as
              training.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
