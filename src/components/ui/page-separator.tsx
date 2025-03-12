
import React from "react";
import { cn } from "@/lib/utils";

interface PageSeparatorProps {
  className?: string;
}

export function PageSeparator({ className }: PageSeparatorProps) {
  return (
    <div className={cn("relative w-full py-4", className)}>
      <div className="absolute inset-0 bg-gray-100/40"></div>
      <div className="container mx-auto relative">
        <div className="h-px w-full bg-primary/20"></div>
      </div>
    </div>
  );
}
