
import React from 'react';
import { StatusCounts } from '@/types/application-types';
import { FilterType } from '@/types/application-types';
import { SortType } from '@/types/application-types';

export interface FilterBarProps {
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: string) => void;
  activeFilters: FilterType;
  activeSort: string;
  statusCounts: StatusCounts;
  isMapView?: boolean;
  onToggleView?: () => void;
  applications?: any[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onFilterChange,
  onSortChange,
  activeFilters,
  activeSort,
  statusCounts,
  isMapView,
  onToggleView,
  applications
}) => {
  const handleStatusChange = (status: string) => {
    onFilterChange('status', status);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value);
  };

  return (
    <div className="filter-bar p-4 bg-gray-100 rounded-lg">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              activeFilters.status === 'Under Review' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
            onClick={() => handleStatusChange('Under Review')}
          >
            Under Review ({statusCounts['Under Review'] || 0})
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              activeFilters.status === 'Approved' ? 'bg-green-500 text-white' : 'bg-white'
            }`}
            onClick={() => handleStatusChange('Approved')}
          >
            Approved ({statusCounts['Approved'] || 0})
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              activeFilters.status === 'Declined' ? 'bg-red-500 text-white' : 'bg-white'
            }`}
            onClick={() => handleStatusChange('Declined')}
          >
            Declined ({statusCounts['Declined'] || 0})
          </button>
        </div>
        
        <div>
          <select
            className="p-2 rounded border"
            value={activeSort}
            onChange={handleSortChange}
          >
            <option value="distance">Distance</option>
            <option value="newest">Newest</option>
            <option value="closingSoon">Closing Soon</option>
            <option value="impact">Impact Score</option>
          </select>
        </div>

        {onToggleView && (
          <button 
            onClick={onToggleView}
            className="px-3 py-1 rounded-full text-sm bg-pink-100 hover:bg-pink-200"
          >
            {isMapView ? 'List View' : 'Map View'}
          </button>
        )}
      </div>
    </div>
  );
};
