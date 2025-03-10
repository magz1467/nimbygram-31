
import React from 'react';
import { PostcodeSearch } from '@/components/PostcodeSearch';
import { Application } from '@/types/planning';
import { Logo } from '@/components/header/Logo';

interface ResultsHeaderProps {
  searchTerm?: string;
  displayTerm?: string;
  resultsCount?: number;
  isLoading?: boolean;
  onSelect?: (postcode: string) => void;
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
  onSelect,
  isMapView,
  applications,
  hasSearched,
  coordinates
}) => {
  return (
    <div className="border-b">
      {/* Logo header row */}
      <div className="py-4 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <Logo />
        </div>
      </div>
      
      {/* Search bar row */}
      {onSelect && (
        <div className="py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="w-full max-w-xl">
              <PostcodeSearch onSelect={onSelect} placeholder="Search location" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
