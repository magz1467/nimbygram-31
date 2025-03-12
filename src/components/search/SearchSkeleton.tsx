
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchSkeletonProps {
  count?: number;
}

/**
 * A component that renders skeleton loaders for search results
 * Uses a fixed height to prevent layout shifts
 */
export function SearchSkeleton({ count = 5 }: SearchSkeletonProps) {
  return (
    <div className="search-skeleton-container" style={{ minHeight: `${count * 160}px` }}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={`skeleton-${index}`} 
          className="search-result-skeleton"
          // Add staggered animation delay for more natural loading appearance
          style={{ 
            animationDelay: `${index * 0.1}s` 
          }}
        >
          <div className="flex items-start gap-4 p-4 border rounded-lg mb-4">
            <div className="skeleton-left">
              <Skeleton className="h-24 w-24 rounded-md" />
            </div>
            <div className="skeleton-content flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
