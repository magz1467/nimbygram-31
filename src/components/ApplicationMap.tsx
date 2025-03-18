import React from 'react';

interface Application {
  id: string;
  title: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  // Other properties
}

interface ApplicationMapProps {
  applications: Application[];
  onMarkerClick?: (application: Application) => void;
  height?: string;
}

const ApplicationMap: React.FC<ApplicationMapProps> = ({ 
  applications, 
  onMarkerClick,
  height = '500px'
}) => {
  // In a real implementation, this would use react-leaflet or Google Maps
  // For now, we'll create a simple placeholder
  
  return (
    <div 
      className="bg-gray-200 rounded-lg overflow-hidden relative"
      style={{ height }}
    >
      {/* Placeholder for map */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-600 mb-2">Map Placeholder</p>
          <p className="text-sm text-gray-500">
            {applications.length} applications available
          </p>
          {applications.map(app => (
            <div 
              key={app.id}
              className="bg-white p-2 rounded mt-2 cursor-pointer hover:bg-blue-50"
              onClick={() => onMarkerClick && onMarkerClick(app)}
            >
              {app.title} - {app.location.address || `${app.location.lat.toFixed(4)}, ${app.location.lng.toFixed(4)}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationMap; 