
import { Application } from "@/types/planning";
import { useToast } from "@/components/ui/use-toast";
import { CardHeader } from "./card/CardHeader";
import { CardImage } from "./card/CardImage";
import { CardActions } from "./card/CardActions";
import { CardContent } from "./card/CardContent";
import { CardFooter } from "./card/CardFooter";

interface SearchResultCardProps {
  application: Application;
  onSeeOnMap?: (id: number) => void;
}

export const SearchResultCard = ({ application, onSeeOnMap }: SearchResultCardProps) => {
  const { toast } = useToast();

  console.log('SearchResultCard - Application:', {
    id: application.id,
    title: application.title,
    streetview_url: application.streetview_url,
    type: typeof application.streetview_url
  });

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "You can now share this planning application with others.",
      });
    } catch (err) {
      toast({
        title: "Couldn't copy link",
        description: "Please try again or copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const handleShowComments = () => {
    if (onSeeOnMap) {
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
        imageUrl={application.streetview_url} 
        title={application.title || ''} 
      />

      <div className="border-y border-gray-100 py-3 px-4">
        <CardActions
          applicationId={application.id}
          onShowComments={handleShowComments}
          onShare={handleShare}
        />
      </div>

      <div className="px-8 py-4">
        <CardContent storybook={application.storybook} />
        <CardFooter 
          onSeeOnMap={() => onSeeOnMap?.(application.id)} 
        />
      </div>
    </article>
  );
};
