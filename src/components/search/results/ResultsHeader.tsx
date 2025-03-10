
import React from 'react';
import { PostcodeSearch } from '@/components/PostcodeSearch';
import { Application } from '@/types/planning';
import { Logo } from '@/components/header/Logo';
import { FilterBar } from '@/components/FilterBar';
import { SortType } from '@/types/application-types';

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
  onFilterChange?: (filterType: string, value: string) => void;
  onSortChange?: (sortType: SortType) => void;
  activeFilters?: {
    status?: string;
    type?: string;
    classification?: string;
  };
  activeSort?: SortType;
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  searchTerm,
  displayTerm,
  resultsCount,
  isLoading,
  onSelect,
  isMapView,
  applications = [],
  hasSearched,
  coordinates,
  onFilterChange,
  onSortChange,
  activeFilters = {},
  activeSort,
  statusCounts = {
    'Under Review': 0,
    'Approved': 0,
    'Declined': 0,
    'Other': 0
  }
}) => {
  return (
    <div className="border-b">
      {/* Logo header row with white background */}
      <div className="py-4 border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Logo />
        </div>
      </div>
      
      {/* Search bar row with filter buttons */}
      {onSelect && (
        <div className="py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="w-full max-w-xl">
                <PostcodeSearch onSelect={onSelect} placeholder="Search location" />
              </div>
              
              {hasSearched && onFilterChange && onSortChange && (
                <div className="flex items-center space-x-2">
                  <FilterBar
                    onFilterChange={onFilterChange}
                    onSortChange={onSortChange}
                    activeFilters={activeFilters}
                    activeSort={activeSort || 'newest'}
                    applications={applications}
                    statusCounts={statusCounts}
                    isMapView={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
