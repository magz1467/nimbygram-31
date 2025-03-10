
import { Header } from "@/components/Header";
import { NoResultsView } from "@/components/search/results/NoResultsView";

interface NoSearchStateViewProps {
  onPostcodeSelect: (postcode: string) => void;
}

export const NoSearchStateView = ({ onPostcodeSelect }: NoSearchStateViewProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <NoResultsView onPostcodeSelect={onPostcodeSelect} />
      </div>
    </div>
  );
};
