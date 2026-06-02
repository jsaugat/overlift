import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "accent" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "accent", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-4 py-1.5 text-sm rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          variant === "accent" && "bg-accent text-[#0a0a0a] hover:bg-accent/90",
          variant === "outline" && "border border-app2 text-muted hover:bg-app2",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
