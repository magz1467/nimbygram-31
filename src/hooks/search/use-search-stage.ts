
import { useState, useEffect } from 'react';

export type SearchStage = 'coordinates' | 'searching' | 'processing' | 'complete' | null;

export const useSearchStage = (isLoadingCoords: boolean, isLoadingResults: boolean) => {
  const [stage, setStage] = useState<SearchStage>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoadingCoords) {
      setStage('coordinates');
      setProgress(25);
    } else if (isLoadingResults) {
      setStage('searching');
      setProgress(50);
    } else if (!isLoadingCoords && !isLoadingResults) {
      setStage('complete');
      setProgress(100);
    }
  }, [isLoadingCoords, isLoadingResults]);

  return { stage, progress };
};

export const getStageLabel = (stage: SearchStage): string => {
  switch (stage) {
    case 'coordinates':
      return 'Finding location...';
    case 'searching':
      return 'Searching for planning applications...';
    case 'processing':
      return 'Processing results...';
    case 'complete':
      return 'Search complete';
    default:
      return 'Searching...';
  }
};
