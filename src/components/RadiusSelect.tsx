
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RadiusSelectProps {
  className?: string;
}

/**
 * Simplified RadiusSelect that always displays 5km with no interactivity
 */
export function RadiusSelect({ className = "" }: RadiusSelectProps) {
  return (
    <div className={`${className}`}>
      <Select disabled={true} value="5">
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Radius: 5km" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5km radius</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
