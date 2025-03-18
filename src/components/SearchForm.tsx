import React, { useState, FormEvent } from 'react';

interface SearchFormProps {
  onSearch?: (query: string, location: string, radius: number) => void;
  initialQuery?: string;
  initialLocation?: string;
  initialRadius?: number;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  initialQuery = '',
  initialLocation = '',
  initialRadius = 5
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [location, setLocation] = useState<string>(initialLocation);
  const [radius, setRadius] = useState<number>(initialRadius);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, location, radius);
    } else {
      alert(`Search for: ${query} near ${location} within ${radius} miles`);
    }
  };

  return (
    <form 
      className="bg-white p-6 rounded-lg shadow-md" 
      onSubmit={handleSubmit}
    >
      <div className="grid md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
            Search for
          </label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter keywords (e.g., extension, new build)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Near
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter postcode or address"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
            Radius
          </label>
          <select
            id="radius"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>1 mile</option>
            <option value={5}>5 miles</option>
            <option value={10}>10 miles</option>
            <option value={20}>20 miles</option>
            <option value={50}>50 miles</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
