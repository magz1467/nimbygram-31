
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";

interface NoResultsViewProps {
  onPostcodeSelect: (postcode: string) => void;
}

export const NoResultsView = ({ onPostcodeSelect }: NoResultsViewProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SearchSection
        onPostcodeSelect={onPostcodeSelect}
        isMapView={false}
        applications={[]}
      />
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-lg text-gray-600">No applications found. Try searching for a different location.</p>
      </div>
    </div>
  );
};
