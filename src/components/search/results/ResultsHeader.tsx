
import React from 'react';
import { PostcodeSearch } from '@/components/PostcodeSearch';
import { Application } from '@/types/planning';

interface ResultsHeaderProps {
  searchTerm?: string;
  displayTerm?: string;
  resultsCount?: number;
  isLoading?: boolean;
  onSelect?: (postcode: string) => void;  // Changed from onPostcodeSelect to onSelect
  isMapView?: boolean;
  applications?: Application[];
  hasSearched?: boolean;
  coordinates?: [number, number] | null;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  searchTerm,
  displayTerm,
  resultsCount,
  isLoading,
  onSelect, // Changed from onPostcodeSelect to onSelect
  isMapView,
  applications,
  hasSearched,
  coordinates
}) => {
  const showResultsCount = !isLoading && resultsCount !== undefined;
  const locationName = displayTerm || searchTerm;

  return (
    <div className="py-4 border-b">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {showResultsCount ? (
              <>
                {resultsCount} planning applications
                {locationName && <span> near {locationName}</span>}
              </>
            ) : isLoading ? (
              'Searching for planning applications...'
            ) : (
              'Planning applications'
            )}
          </h1>
        </div>
        
        {onSelect && (
          <div className="w-full md:w-auto">
            <PostcodeSearch onSelect={onSelect} />
          </div>
        )}
      </div>
    </div>
  );
};
