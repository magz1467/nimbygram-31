
import React, { useEffect } from 'react';
import { Application } from "@/types/planning";
import { useState } from "react";
import { CardHeader } from "./card/CardHeader";
import { CardImage } from "./card/CardImage";
import { CardActions } from "./card/CardActions";
import { CardContent } from "./card/CardContent";
import { CommentList } from "@/components/comments/CommentList";
import { format } from "date-fns";
import { getImageUrl } from "@/utils/imageUtils";
import { CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleShare = async () => {
    // Create a shareable URL that includes the application ID
    const baseUrl = window.location.origin + window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('application', application.id.toString());
    const shareUrl = `${baseUrl}?${searchParams.toString()}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this link to show this planning application to others.",
        duration: 3000,
      });
    } catch (err) {
      console.error("Couldn't copy link:", err);
      toast({
        title: "Couldn't copy link",
        description: "Please try again or copy the URL from your browser.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComments = () => {
    setShowComments(prev => !prev);
  };

  // Enhanced logging for content data
  useEffect(() => {
    console.log(`SearchResultCard for application ${application.id}:`, { 
      hasStorybook: Boolean(application.storybook),
      hasShortStory: Boolean(application.short_story),
      storybook: application.storybook ? {
        type: typeof application.storybook,
        length: application.storybook.length
      } : null,
      shortStory: application.short_story ? {
        type: typeof application.short_story,
        length: application.short_story.length
      } : null,
      description: application.description?.substring(0, 30),
      title: application.title
    });
    
    if (application.storybook) {
      console.log('SearchResultCard storybook preview for app', application.id, ':', 
        application.storybook.substring(0, 100) + '...');
    } else if (application.short_story) {
      console.log('SearchResultCard using short_story fallback for app', application.id, ':', 
        application.short_story.substring(0, 100) + '...');
    } else {
      console.log('SearchResultCard missing both storybook and short_story for app', application.id);
    }
  }, [application]);

  const formattedSubmittedDate = application.submittedDate || application.received_date
    ? new Date(application.submittedDate || application.received_date).toString() !== "Invalid Date"
      ? format(new Date(application.submittedDate || application.received_date), 'dd MMM yyyy')
      : null
    : null;

  const formattedReceivedDate = application.received
    ? new Date(application.received).toString() !== "Invalid Date"
      ? format(new Date(application.received), 'dd MMM yyyy')
      : null
    : null;

  const imageUrl = getImageUrl(application.streetview_url || application.image || application.image_map_url);

  const handleSeeOnMap = () => {
    console.log('📍 See on map clicked for application:', application.id);
    if (application.id && onSeeOnMap) {
      onSeeOnMap(application.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader 
        title={application.title || ''} 
        address={application.address} 
        storybook={application.storybook || application.short_story} 
      />

      <CardImage 
        imageUrl={imageUrl} 
        title={application.title || ''} 
      />

      {(formattedReceivedDate || formattedSubmittedDate) && (
        <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <CalendarDays className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-medium">Received:</span>
            <span>{formattedReceivedDate || formattedSubmittedDate || 'Date not available'}</span>
          </div>
        </div>
      )}

      <div className="border-y border-gray-100 py-3 px-4">
        <CardActions
          applicationId={application.id}
          onShowComments={handleToggleComments}
          onShare={handleShare}
        />
      </div>

      <div className="p-4">
        {application.notes && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            {application.notes}
          </div>
        )}
        
        <CardContent 
          storybook={application.storybook} 
          shortStory={application.short_story} // Pass short_story as fallback
          onSeeOnMap={handleSeeOnMap}
          applicationId={application.id}
          applications={applications}
          selectedId={selectedId}
          coordinates={application.coordinates || coordinates}
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
