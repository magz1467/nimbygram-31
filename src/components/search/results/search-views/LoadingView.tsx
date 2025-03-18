import React from 'react';

// Define the LoadingStage type that's referenced in the error
export type LoadingStage = 'loading' | 'searching';

// Define the props interface based on how it's used in SearchView.tsx
interface LoadingViewProps {
  stage: LoadingStage;
  isLongRunning: boolean;
  searchTerm: string;
  onRetry: () => void;
}

export function LoadingView({ 
  stage, 
  isLongRunning, 
  searchTerm, 
  onRetry 
}: LoadingViewProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        {/* Loading spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <h2 className="text-xl font-semibold mb-2">
        {stage === 'loading' ? 'Loading...' : `Searching for "${searchTerm}"`}
      </h2>
      
      <p className="text-gray-600 mb-4">
        {stage === 'loading' 
          ? 'Please wait while we prepare your results.' 
          : 'We\'re searching for planning applications in this area.'}
      </p>
      
      {isLongRunning && (
        <div className="mt-4">
          <p className="text-amber-600 mb-2">
            This is taking longer than expected.
          </p>
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
