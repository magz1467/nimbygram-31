
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorViewProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-gray-600 max-w-md mb-2">
        We encountered a problem while searching for planning applications.
      </p>
      <div className="bg-gray-100 p-3 rounded-md text-sm text-left text-gray-700 mb-6 max-w-md overflow-auto">
        {error.message}
      </div>
      
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
