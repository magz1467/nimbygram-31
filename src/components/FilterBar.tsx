
import { MapToggle } from './MapToggle';
import { SortType } from '../types/application-types';

interface FilterBarProps {
  activeSort?: any;
  onSortChange?: (value: any) => void;
  onFilterChange?: (filterType: string, value: string) => void;
  activeFilters?: {
    status?: string;
    type?: string;
  };
  isMapView?: boolean;
  onToggleView?: () => void;
  applications?: any[];
  statusCounts?: {
    'Under Review': number;
    'Approved': number;
    'Declined': number;
    'Other': number;
  };
}

export function FilterBar({ 
  activeSort, 
  onSortChange,
  onFilterChange,
  activeFilters,
  isMapView,
  onToggleView,
  applications,
  statusCounts
}: FilterBarProps) {
  return (
    <div className="bg-white border-b p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <select 
          value={activeSort}
          onChange={(e) => onSortChange && onSortChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="date">Date (newest)</option>
          <option value="distance">Distance</option>
          <option value="status">Status</option>
        </select>
        <span className="text-sm text-gray-500">Sort by</span>
      </div>
      {onToggleView && <MapToggle isMapView={isMapView} onToggle={onToggleView} />}
    </div>
  );
}
