
import { useEffect, useState } from 'react';
import { LoadingSkeletons } from '@/components/search/results/components/LoadingSkeletons';
import { LoadingStage } from '@/hooks/use-loading-state';
import { Clock } from 'lucide-react';

interface LoadingViewProps {
  stage: LoadingStage;
  isLongRunning: boolean;
  searchTerm: string;
  onRetry: () => void;
}

export function LoadingView({ stage, isLongRunning, searchTerm, onRetry }: LoadingViewProps) {
  const [dots, setDots] = useState('');
  const [showingResults, setShowingResults] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // After a delay, inform user we might show partial results
  useEffect(() => {
    if (stage === 'searching') {
      const timer = setTimeout(() => {
        setShowingResults(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stage]);
  
  const getLoadingMessage = () => {
    switch (stage) {
      case 'coordinates':
        return `Finding location "${searchTerm}"${dots}`;
      case 'searching':
        return showingResults 
          ? `Finding planning applications${dots}`
          : `Searching for planning applications${dots}`;
      case 'rendering':
        return `Processing results${dots}`;
      default:
        return `Loading${dots}`;
    }
  };
  
  return (
    <div className="pt-6 pb-12">
      <div className="text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          {getLoadingMessage()}
        </h2>
        <p className="text-gray-500 text-sm">
          {stage === 'coordinates' ? 'Converting your location to coordinates...' : 
           stage === 'searching' ? (showingResults ? 'Results will appear as they are found. Please wait...' : 'Scanning all local planning applications...') : 
           'Processing and analyzing results...'}
        </p>
      </div>
      
      {isLongRunning && (
        <div className="max-w-lg mx-auto mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">Still searching...</h3>
            <p className="text-amber-700 text-sm mt-1">
              There might be many planning applications in this area. Results will appear as they become available.
            </p>
            {showingResults && !isLongRunning && (
              <p className="text-amber-700 text-sm mt-1">
                We're still searching for applications. This may take a few more moments.
              </p>
            )}
          </div>
        </div>
      )}
      
      <LoadingSkeletons isLongSearch={isLongRunning} onRetry={onRetry} />
    </div>
  );
}
