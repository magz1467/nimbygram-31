
import { Application } from "@/types/planning";
import { useState } from "react";
import { CardHeader } from "./card/CardHeader";
import { CardImage } from "./card/CardImage";
import { CardActions } from "./card/CardActions";
import { CardContent } from "./card/CardContent";
import { CommentList } from "@/components/comments/CommentList";
import { format } from "date-fns";

interface SearchResultCardProps {
  application: Application;
  onSeeOnMap?: (id: number) => void;
}

export const SearchResultCard = ({ application, onSeeOnMap }: SearchResultCardProps) => {
  const [showComments, setShowComments] = useState(false);

  console.log('SearchResultCard - Application:', {
    id: application.id,
    title: application.title,
    streetview_url: application.streetview_url,
    image: application.image,
    type: typeof application.streetview_url,
    submittedDate: application.submittedDate || application.received_date
  });

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

  // Format the submitted date
  const formattedSubmittedDate = application.submittedDate || application.received_date
    ? new Date(application.submittedDate || application.received_date).toString() !== "Invalid Date"
      ? format(new Date(application.submittedDate || application.received_date), 'dd MMM yyyy')
      : null
    : null;

  // Determine the best image URL to use
  const imageUrl = application.streetview_url || application.image || application.image_map_url;

  // Handle see on map button click
  const handleSeeOnMap = () => {
    if (onSeeOnMap && application.id) {
      onSeeOnMap(application.id);
    }
  };

  return (
    <article id={`application-${application.id}`} className="bg-white rounded-lg shadow-sm overflow-hidden max-w-2xl mx-auto mb-8">
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

      <div className="px-8 py-4">
        {formattedSubmittedDate && (
          <div className="text-sm text-gray-500 mb-3">
            <span className="font-medium">Submitted date:</span> {formattedSubmittedDate}
          </div>
        )}
        
        <CardContent 
          storybook={application.storybook} 
          onSeeOnMap={handleSeeOnMap}
        />

        {showComments && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium mb-2">Comments</h3>
            <CommentList applicationId={application.id} />
          </div>
        )}
      </div>
    </article>
  );
};
