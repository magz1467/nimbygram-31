
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Search } from 'lucide-react';

interface NoResultsViewProps {
  searchTerm: string;
  onRetry?: () => void;
}

export function NoResultsView({ searchTerm, onRetry }: NoResultsViewProps) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center">
      <Search className="h-12 w-12 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2">No planning applications found</h2>
      <p className="text-gray-600 max-w-md mb-6">
        We couldn't find any planning applications near "{searchTerm}". 
        Please try a different location or check your spelling.
      </p>
      
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
