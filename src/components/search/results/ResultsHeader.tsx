
import React from 'react';
import { PostcodeSearch } from '@/components/PostcodeSearch';
import { Application } from '@/types/planning';
import { Logo } from '@/components/header/Logo';
import { FilterControls } from '@/components/map/filter/FilterControls';
import { SortType } from '@/types/application-types';
import { Filter, ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cacheCoordinates } from '@/services/coordinates/coordinates-cache';

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
  // Cache the coordinates when they become available (to speed up future searches)
  React.useEffect(() => {
    if (searchTerm && coordinates) {
      cacheCoordinates(searchTerm, coordinates, displayTerm || searchTerm);
    }
  }, [searchTerm, coordinates, displayTerm]);

  return (
    <div className="border-b">
      {/* Logo header row with white background */}
      <div className="py-4 border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Logo />
        </div>
      </div>
      
      {/* Search bar row */}
      {onSelect && (
        <div className="py-4 bg-[#f9f9f9]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col space-y-4">
              {/* Search bar */}
              <div className="w-full">
                <PostcodeSearch 
                  onSelect={onSelect} 
                  placeholder="Search location" 
                  className="w-full max-w-full"
                />
              </div>
              
              {/* Filter and Sort Controls */}
              {hasSearched && onFilterChange && onSortChange && (
                <div className="w-full">
                  <div className="flex flex-col space-y-3">
                    {/* Filter and Sort Buttons */}
                    <div className="flex items-center justify-between w-full">
                      <div className="text-sm font-medium text-gray-700">
                        {resultsCount !== undefined && !isLoading ? (
                          <span>
                            {resultsCount} {resultsCount === 1 ? 'result' : 'results'} 
                            {displayTerm ? ` for "${displayTerm}"` : ''}
                          </span>
                        ) : isLoading ? (
                          <span>Loading results...</span>
                        ) : null}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-1 ${
                            Object.keys(activeFilters).length > 0 ? 'bg-primary/10 border-primary/20' : ''
                          }`}
                          onClick={() => {
                            const filterButton = document.getElementById('filter-dropdown-trigger');
                            if (filterButton) filterButton.click();
                          }}
                        >
                          <Filter className="h-4 w-4" />
                          <span>Filter</span>
                          {Object.keys(activeFilters).length > 0 && (
                            <span className="ml-1 rounded-full bg-primary w-5 h-5 flex items-center justify-center text-xs text-white">
                              {Object.keys(activeFilters).length}
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-1 ${
                            activeSort ? 'bg-primary/10 border-primary/20' : ''
                          }`}
                          onClick={() => {
                            const sortButton = document.getElementById('sort-dropdown-trigger');
                            if (sortButton) sortButton.click();
                          }}
                        >
                          <ArrowDownUp className="h-4 w-4" />
                          <span>{activeSort === 'distance' ? 'Distance' : 
                                  activeSort === 'newest' ? 'Newest' : 
                                  activeSort === 'closingSoon' ? 'Closing Soon' : 'Sort'}</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Category Filters */}
                    <div className="w-full overflow-x-auto hide-scrollbar">
                      <div className="flex space-x-2 pb-1">
                        <FilterControls 
                          onFilterChange={onFilterChange}
                          onSortChange={onSortChange}
                          activeFilters={activeFilters}
                          activeSort={activeSort || 'newest'}
                          applications={applications}
                          statusCounts={statusCounts}
                          isMapView={false}
                          showCategoryFiltersOnly={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
