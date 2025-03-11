
import React from 'react';
import { Application } from "@/types/planning";
import { useState } from "react";
import { CardHeader } from "./card/CardHeader";
import { CardImage } from "./card/CardImage";
import { CardActions } from "./card/CardActions";
import { CardContent } from "./card/CardContent";
import { CommentList } from "@/components/comments/CommentList";
import { format } from "date-fns";
import { getImageUrl } from "@/utils/imageUtils";

interface SearchResultCardProps {
  application: Application;
  onSeeOnMap: (id: number) => void;
  applications?: Application[];
  selectedId?: number | null;
  coordinates?: [number, number] | null;
  handleMarkerClick?: (id: number) => void;
  isLoading?: boolean;
  postcode?: string;
}

export const SearchResultCard = ({ 
  application, 
  onSeeOnMap,
  applications = [],
  selectedId = null,
  coordinates = null,
  handleMarkerClick,
  isLoading = false,
  postcode = ""
}: SearchResultCardProps) => {
  const [showComments, setShowComments] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error("Couldn't copy link:", err);
    }
  };

  const handleToggleComments = () => {
    setShowComments(prev => !prev);
  };

  const formattedSubmittedDate = application.submittedDate || application.received_date
    ? new Date(application.submittedDate || application.received_date).toString() !== "Invalid Date"
      ? format(new Date(application.submittedDate || application.received_date), 'dd MMM yyyy')
      : null
    : null;

  const imageUrl = getImageUrl(application.streetview_url || application.image || application.image_map_url);

  const handleSeeOnMap = () => {
    if (onSeeOnMap && application.id) {
      console.log('📍 See on map clicked for application:', application.id);
      onSeeOnMap(application.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader 
        title={application.title || ''} 
        address={application.address} 
        storybook={application.storybook} 
      />

      <CardImage 
        imageUrl={imageUrl} 
        title={application.title || ''} 
      />

      <div className="border-y border-gray-100 py-3 px-4">
        <CardActions
          applicationId={application.id}
          onShowComments={handleToggleComments}
          onShare={handleShare}
        />
      </div>

      <div className="p-4">
        
        <CardContent 
          storybook={application.storybook} 
          onSeeOnMap={handleSeeOnMap}
          applicationId={application.id}
          applications={applications}
          selectedId={selectedId}
          coordinates={coordinates}
          handleMarkerClick={handleMarkerClick}
          isLoading={isLoading}
          postcode={postcode}
        />

        {showComments && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium mb-2">Comments</h3>
            <CommentList applicationId={application.id} />
          </div>
        )}
      </div>
    </div>
  );
};
