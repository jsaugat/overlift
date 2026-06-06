"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteProgramDialogProps {
  programName: string;
  onConfirm: () => void;
  trigger: ReactNode;
}

export function DeleteProgramDialog({
  programName,
  onConfirm,
  trigger,
}: DeleteProgramDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-app border border-app2 text-app">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-play uppercase">
            Delete Program?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted">
            This will permanently delete{" "}
            <span className="text-app font-semibold">
              &ldquo;{programName}&rdquo;
            </span>{" "}
            and all its days and exercises. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-app bg-app3/50">
          <AlertDialogCancel className="border-app2 bg-transparent hover:bg-app2">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete Program
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
