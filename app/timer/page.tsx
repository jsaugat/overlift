import { AppHeader } from "@/components/app-header";
import { Nav } from "@/components/nav";
import { RestTimer } from "@/components/rest-timer";

export default function TimerPage() {
  return (
    <>
      <AppHeader />
      <div className="bg-app border border-app rounded-xl mt-2 overflow-hidden">
        <Nav />
        <div className="p-4">
          <div className="md:block">
            <h2 className="text-xl font-medium text-app mb-1 uppercase">
              Rest timer
            </h2>
            <p className="text-sm text-muted mb-4">
              Select a preset or set a custom duration between sets.
            </p>
          </div>
          <RestTimer />
        </div>
      </div>
    </>
  );
}
