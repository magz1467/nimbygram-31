
import { Application } from "@/types/planning";
import { SearchResultCard } from "./SearchResultCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResultsListProps {
  applications: Application[];
  isLoading: boolean;
}

export const SearchResultsList = ({ applications, isLoading }: SearchResultsListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-8">
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
    <div className="grid gap-8">
      {applications.map((application) => (
        <SearchResultCard key={application.id} application={application} />
      ))}
    </div>
  );
};
