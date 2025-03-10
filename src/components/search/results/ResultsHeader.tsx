
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";

interface ResultsHeaderProps {
  onPostcodeSelect: (postcode: string) => void;
  isMapView: boolean;
  applications?: any[];
}

export const ResultsHeader = ({ 
  onPostcodeSelect, 
  isMapView, 
  applications 
}: ResultsHeaderProps) => {
  return (
    <>
      <Header />
      <SearchSection
        onPostcodeSelect={onPostcodeSelect}
        isMapView={isMapView}
        applications={applications}
      />
    </>
  );
};
