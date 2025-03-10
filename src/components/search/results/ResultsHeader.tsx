
import React from 'react';
import { Link } from 'react-router-dom';
import { PostcodeSearch } from '@/components/PostcodeSearch';
import { Application } from '@/types/planning';
import { Home } from 'lucide-react';

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
    <div className="py-4 border-b">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold font-playfair" 
              style={{
                color: "#af5662", // Honeysuckle
                letterSpacing: "0.05em",
                textTransform: "lowercase"
              }}>
              nimbygram
            </span>
          </Link>
        </div>
        
        {onSelect && (
          <div className="w-full md:w-80">
            <PostcodeSearch onSelect={onSelect} />
          </div>
        )}
      </div>
    </div>
  );
};
