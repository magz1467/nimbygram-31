
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RadiusSelectProps {
  className?: string;
}

/**
 * Simplified RadiusSelect that always displays 5km with no interactivity
 * Fixed to avoid any state changes or re-renders
 */
export function RadiusSelect({ className = "" }: RadiusSelectProps) {
  return (
    <div className={`${className}`}>
      <div className="w-[160px] h-10 px-3 py-2 flex items-center rounded-md border border-input bg-transparent text-sm ring-offset-background">
        <span className="text-sm">Radius: 5km</span>
      </div>
    </div>
  );
}
