
import { MapToggle } from './MapToggle';

export function FilterBar({ activeSort, onSortChange }) {
  return (
    <div className="bg-white border-b p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <select 
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="date">Date (newest)</option>
          <option value="distance">Distance</option>
          <option value="status">Status</option>
        </select>
        <span className="text-sm text-gray-500">Sort by</span>
      </div>
      <MapToggle />
    </div>
  );
}
