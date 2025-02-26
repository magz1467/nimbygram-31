
import { Application } from "@/types/planning";
import { SearchResultCard } from "./SearchResultCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface SearchResultsListProps {
  applications: Application[];
  isLoading: boolean;
}

export const SearchResultsList = ({ applications, isLoading }: SearchResultsListProps) => {
  const [displayCount, setDisplayCount] = useState(10);

  const displayedApplications = applications.slice(0, displayCount);
  const hasMore = displayCount < applications.length;

  const handleSeeMore = () => {
    setDisplayCount(prevCount => prevCount + 10);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center">
          <Progress value={33} className="w-[60%] mb-2" />
          <p className="text-sm text-muted-foreground">Loading planning applications...</p>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-[300px] w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!applications.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No planning applications found in this area.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8">
        {displayedApplications.map((application) => (
          <SearchResultCard key={application.id} application={application} />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleSeeMore}
            className="flex items-center gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            See More ({applications.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};
