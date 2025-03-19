
import { Application } from "@/types/planning";
import { Card } from "@/components/ui/card";
import { MapPin, Bookmark, Heart } from "lucide-react";
import { getStatusColor } from "@/utils/statusColors";
import { ApplicationTitle } from "@/components/applications/ApplicationTitle";

interface ApplicationDetailsProps {
  application: Application;
  onClose: () => void;
}

export const ApplicationDetails = ({ application, onClose }: ApplicationDetailsProps) => {
  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          {application.image && (
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={application.image}
                alt={application.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <ApplicationTitle 
              title={application.title || application.description || ''} 
              className="mb-2"
            />
            <div className="flex items-center gap-1 mt-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm truncate">{application.address}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(application.status.toLowerCase())}`}>
                {application.status}
              </span>
              <span className="text-xs text-gray-500">{application.distance}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2 border-t">
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Card>
  );
};
