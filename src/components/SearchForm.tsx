import React, { useState, FormEvent } from 'react';
import { useAddressSuggestions } from '../hooks/use-address-suggestions';

interface SearchFormProps {
  onSearch: (query: string, location: string, radius: number) => void;
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
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  
  const { suggestions, loading } = useAddressSuggestions(location);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query, location, radius);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="query">Search for</label>
        <input
          type="text"
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. extension, new build, change of use"
        />
      </div>
      
      <div className="form-group location-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Enter postcode or address"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((suggestion) => (
              <li 
                key={suggestion.id} 
                onClick={() => handleSuggestionClick(suggestion.text)}
              >
                {suggestion.text}
              </li>
            ))}
          </ul>
        )}
        
        {loading && <div className="loading-indicator">Loading...</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="radius">Radius (miles)</label>
        <select
          id="radius"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        >
          <option value={1}>1 mile</option>
          <option value={5}>5 miles</option>
          <option value={10}>10 miles</option>
          <option value={20}>20 miles</option>
          <option value={50}>50 miles</option>
        </select>
      </div>
      
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
};
