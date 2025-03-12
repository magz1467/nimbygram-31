
import React from 'react';
import { Application } from '@/types/planning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistance } from '@/utils/distance';

interface SearchResultCardProps {
  application: Application;
}

const SearchResultCard = ({ application }: SearchResultCardProps) => {
  // Convert string distance to number if it exists
  const distanceNumber = application.distance 
    ? parseFloat(application.distance) 
    : undefined;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          {application.title || application.reference || 'Planning Application'}
        </CardTitle>
        <div className="text-sm text-muted-foreground">{application.address}</div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-1">
          {application.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {application.status}
            </span>
          )}
          {distanceNumber !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {formatDistance(distanceNumber)}
            </span>
          )}
          {application.type && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {application.type}
            </span>
          )}
        </div>
        
        {application.description && (
          <p className="mt-3 text-sm line-clamp-3">{application.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchResultCard;
