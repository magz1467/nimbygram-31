
import React from 'react';
import { Application } from '@/types/planning';
import ResultsListView from './ResultsListView';

interface ResultsContainerProps {
  applications: Application[];
  isLoading: boolean;
  error: Error | null;
}

export const ResultsContainer = ({ applications, isLoading, error }: ResultsContainerProps) => {
  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-700 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <ResultsListView applications={applications} isLoading={isLoading} />
    </div>
  );
};

export default ResultsContainer;
