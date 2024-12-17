import { MobileApplicationCards } from "../MobileApplicationCards";
import { DesktopSidebar } from "../DesktopSidebar";
import { MapHeader } from "../MapHeader";
import { MapContainerComponent } from "../MapContainer";
import { LoadingOverlay } from "../LoadingOverlay";
import { FilterBar } from "@/components/FilterBar";
import { PlanningApplicationDetails } from "@/components/PlanningApplicationDetails";
import { getStatusColor } from "@/utils/statusColors";
import { useEffect, useRef } from "react";

interface MapLayoutProps {
  isLoading: boolean;
  coordinates: [number, number];
  postcode: string;
  selectedApplication: number | null;
  filteredApplications: any[];
  activeFilters: {
    status?: string;
    type?: string;
  };
  activeSort: 'closingSoon' | 'newest' | null;
  isMapView: boolean;
  isMobile: boolean;
  onMarkerClick: (id: number) => void;
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: 'closingSoon' | 'newest' | null) => void;
  onToggleView: () => void;
}

export const MapLayout = ({
  isLoading,
  coordinates,
  postcode,
  selectedApplication,
  filteredApplications,
  activeFilters,
  activeSort,
  isMapView,
  isMobile,
  onMarkerClick,
  onFilterChange,
  onSortChange,
  onToggleView,
}: MapLayoutProps) => {
  const selectedApp = filteredApplications.find(app => app.id === selectedApplication);
  const detailsContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when selected application changes
  useEffect(() => {
    if (detailsContainerRef.current) {
      detailsContainerRef.current.scrollTop = 0;
    }
  }, [selectedApplication]);

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden">
      {isLoading && <LoadingOverlay />}
      
      <MapHeader 
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        activeFilters={activeFilters}
        activeSort={activeSort}
        isMapView={isMapView}
        onToggleView={onToggleView}
      />
      
      <div className="flex flex-1 min-h-0 relative">
        {!isMobile && (
          <DesktopSidebar
            applications={filteredApplications}
            selectedApplication={selectedApplication}
            postcode={postcode}
            activeFilters={activeFilters}
            activeSort={activeSort}
            onFilterChange={onFilterChange}
            onSortChange={onSortChange}
            onSelectApplication={onMarkerClick}
            onClose={() => onMarkerClick(null)}
          />
        )}
        
        <div 
          className={`flex-1 relative ${isMobile ? (isMapView ? 'block' : 'hidden') : 'block'}`}
          style={{ height: isMobile ? 'calc(100dvh - 120px)' : '100%' }}
        >
          <MapContainerComponent
            coordinates={coordinates}
            postcode={postcode}
            applications={filteredApplications}
            selectedApplication={selectedApplication}
            onMarkerClick={onMarkerClick}
          />

          {isMobile && selectedApplication !== null && (
            <MobileApplicationCards
              applications={filteredApplications}
              selectedId={selectedApplication}
              onSelectApplication={onMarkerClick}
            />
          )}
        </div>
        
        {isMobile && !isMapView && (
          <div className="flex-1 flex flex-col h-full max-h-[100dvh] overflow-hidden bg-gray-50">
            {selectedApplication !== null && selectedApp ? (
              <div className="h-full flex flex-col bg-white">
                <div className="sticky top-0 z-50 border-b py-2 px-4 bg-white flex justify-between items-center shadow-sm">
                  <h2 className="font-semibold">Planning Application Details</h2>
                  <button 
                    onClick={() => onMarkerClick(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <div ref={detailsContainerRef} className="flex-1 overflow-y-auto">
                  <PlanningApplicationDetails
                    application={selectedApp}
                    onClose={() => onMarkerClick(null)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white p-4 rounded-lg shadow-sm cursor-pointer flex gap-4"
                    onClick={() => onMarkerClick(app.id)}
                  >
                    {app.image && (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={app.image}
                          alt={app.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary">{app.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{app.address}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        <span className="text-xs text-gray-500">{app.distance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};