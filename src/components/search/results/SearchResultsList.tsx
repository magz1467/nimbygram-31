
import React from 'react';
import { Application } from '@/types/planning';
import SearchResultCard from '../SearchResultCard';

interface SearchResultsListProps {
  applications: Application[];
  isLoading?: boolean;
}

export const SearchResultsList = ({ applications, isLoading }: SearchResultsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 h-40 rounded-lg"></div>
        ))}
      </div>
    );
  }
  
  if (!applications.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No planning applications found in this area.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <SearchResultCard key={application.id} application={application} />
      ))}
    </div>
  );
};

export default SearchResultsList;
