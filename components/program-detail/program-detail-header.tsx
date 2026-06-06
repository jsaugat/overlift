"use client";

import Link from "next/link";
import { ChevronLeft, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgramDetailHeaderProps {
  programName: string;
  onRenameClick: () => void;
}

export function ProgramDetailHeader({
  programName,
  onRenameClick,
}: ProgramDetailHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <Link href="/programs">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-3.5 h-3.5" />
            All programs
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2.5 text-xl sm:text-3xl font-play leading-tight py-4 min-w-0">
        <div className="flex-1 flex items-center gap-2">
          <Dumbbell
            className="min-h-4 sm:min-h-5 min-w-4 sm:min-w-5 shrink-0 text-primary"
            size={24}
          />
          <h1
            className="min-w-0 truncate text-primary bg-clip-text w-fit cursor-pointer"
            title={programName}
            onClick={onRenameClick}
          >
            {programName}
          </h1>
        </div>
      </div>
    </>
  );
}
