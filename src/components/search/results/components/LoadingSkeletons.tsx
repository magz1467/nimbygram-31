import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface LoadingSkeletonsProps {
  count: number;
  isLongSearch?: boolean;
  onRetry?: () => void;
}

export const LoadingSkeletons = ({ count, isLongSearch = false, onRetry }: LoadingSkeletonsProps) => {
  const [loadingMessage, setLoadingMessage] = useState("Loading results...");
  const [artificialProgress, setArtificialProgress] = useState(0);
  
  useEffect(() => {
    if (!isLongSearch) return;
    
    const messages = [
      "Loading results...",
      "This area has many planning applications...",
      "Still working on it...",
      "Almost there...",
      "Retrieving applications..."
    ];
    
    let messageIndex = 0;
    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [isLongSearch]);
  
  useEffect(() => {
    if (!isLongSearch) return;
    
    setArtificialProgress(10);
    
    const intervalId = setInterval(() => {
      setArtificialProgress(prev => {
        if (prev >= 90) {
          clearInterval(intervalId);
          return 90;
        }
        
        const increment = prev < 30 ? 5 : (prev < 60 ? 3 : 1);
        return prev + increment;
      });
    }, 800);
    
    return () => clearInterval(intervalId);
  }, [isLongSearch]);
  
  return (
    <div className="space-y-6">
      {isLongSearch && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">{loadingMessage}</p>
          <Progress value={artificialProgress} className="h-1" />
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-4 text-sm text-primary hover:text-primary/80"
            >
              Try a different search
            </button>
          )}
        </div>
      )}
      
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <div className="flex space-x-4">
            <Skeleton className="h-24 w-24 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="h-0.5 w-full" />
        </div>
      ))}
    </div>
  );
};
