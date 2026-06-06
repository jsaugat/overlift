"use client";

import { AppHeader } from "@/components/app-header";
import { Nav } from "@/components/nav";
import { RestTimer } from "@/components/rest-timer";
import { useSearchParams } from "next/navigation";

export default function TimerPage() {
  const searchParams = useSearchParams();
  const seconds = searchParams.get("seconds");

  return (
    <>
      <AppHeader />
      <div className="bg-app border border-app rounded-xl mt-2 overflow-hidden">
        <Nav />
        <div className="p-4">
          <div className="md:block">
            <h2 className="text-app mb-1 uppercase font-play tracking-wide">
              Rest timer
            </h2>
            <p className="text-sm text-muted mb-4">
              Select a preset or set a custom duration between sets.
            </p>
          </div>
          <RestTimer initialSeconds={seconds ? parseInt(seconds) : 60} />
        </div>
      </div>
    </>
  );
}
