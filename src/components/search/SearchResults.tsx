
import { useSpatialSearch } from "@/hooks/use-spatial-search";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchCoordinates } from "@/types/search";
import { Loader2 } from "lucide-react";

interface SearchResultsProps {
  coordinates: SearchCoordinates | null;
  onRetry: () => void;
}

export function SearchResults({ coordinates, onRetry }: SearchResultsProps) {
  const { data, isLoading, isError } = useSpatialSearch(coordinates);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || data?.method === 'error') {
    return (
      <Alert variant="destructive" className="m-4">
        <h3 className="font-medium mb-2">Search Error</h3>
        <p className="text-sm mb-4">Failed to retrieve planning applications. Please try again.</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Retry Search
        </Button>
      </Alert>
    );
  }

  if (!data?.applications.length) {
    return (
      <div className="text-center p-8">
        <h3 className="font-medium mb-2">No Results Found</h3>
        <p className="text-sm text-muted-foreground">
          No planning applications found within {SEARCH_RADIUS}km radius.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Found {data.applications.length} applications
        </h2>
        <span className="text-sm text-muted-foreground">
          Search took {data.timing?.duration}ms
        </span>
      </div>

      {data.applications.map((app) => (
        <Card key={app.id} className="p-4">
          <h3 className="font-medium">{app.title || app.reference}</h3>
          <p className="text-sm text-muted-foreground mt-1">{app.address}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {app.status}
            </span>
            {app.type && (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {app.type}
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
