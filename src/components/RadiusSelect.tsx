
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RadiusSelectProps {
  radius?: number;
  onChange?: (radius: number) => void;
  className?: string;
  disabled?: boolean;
  // Add value prop for compatibility with form components
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
  const handleValueChange = (newValue: string) => {
    if (onChange) {
      onChange(parseInt(newValue, 10));
    }
  };

  return (
    <div className={`${className}`}>
      <Select 
        disabled={true} 
        value="5"
        onValueChange={handleValueChange}
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
