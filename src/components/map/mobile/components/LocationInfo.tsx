
import { MapPin } from "lucide-react";
import React from "react";

interface LocationInfoProps {
  address: string;
}

export const LocationInfo: React.FC<LocationInfoProps> = ({ address }) => {
  return (
    <div className="flex items-center text-xs text-gray-500">
      <MapPin className="h-3 w-3 mr-1 text-primary" />
      <span className="truncate">{address}</span>
    </div>
  );
};
