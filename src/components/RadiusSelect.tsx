
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RadiusSelectProps {
  radius?: number;
  onChange?: (radius: number) => void;
  className?: string;
  disabled?: boolean;
  value?: string;
}

/**
 * Simplified RadiusSelect that always displays 5km
 */
export function RadiusSelect({ 
  className = "", 
  disabled = false,
  onChange,
  value = "5" 
}: RadiusSelectProps) {
  return (
    <div className={`${className}`}>
      <Select 
        disabled={true} 
        value="5"
        onValueChange={(value) => onChange?.(parseInt(value, 10))}
      >
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
