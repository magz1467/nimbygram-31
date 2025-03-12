
import React from "react";
import { cn } from "@/lib/utils";

interface PageSeparatorProps {
  className?: string;
}

export function PageSeparator({ className }: PageSeparatorProps) {
  return (
    <div className={cn("fixed inset-y-0 w-full pointer-events-none z-0", className)}>
      <div className="container h-full mx-auto relative">
        {/* Left separator */}
        <div className="absolute left-0 inset-y-0 w-px bg-primary/20"></div>
        {/* Right separator */}
        <div className="absolute right-0 inset-y-0 w-px bg-primary/20"></div>
      </div>
    </div>
  );
}
