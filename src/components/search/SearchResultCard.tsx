
import { Application } from "@/types/planning";
import { formatStorybook } from "@/utils/storybook-formatter";
import { MapPin, Share2, MessageCircle, ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface SearchResultCardProps {
  application: Application;
}

export const SearchResultCard = ({ application }: SearchResultCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const storybook = formatStorybook(application.storybook);

  console.log('SearchResultCard - Application:', {
    id: application.id,
    title: application.title,
    streetview_url: application.streetview_url,
    type: typeof application.streetview_url
  });

  const handleSeeOnMap = () => {
    navigate('/map', {
      state: {
        selectedApplication: application,
        coordinates: application.coordinates
      }
    });
  };

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

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `Check out this planning application: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const parseHtmlContent = (content: string) => {
    // Remove HTML tags but preserve line breaks
    return content
      .replace(/<\/?strong>/g, '') // Remove strong tags
      .replace(/<\/?p>/g, '') // Remove p tags
      .replace(/<br\/?>/g, '\n') // Convert <br> to newlines
      .trim();
  };

  const getKeyDetails = (content: string) => {
    const detailsSection = content.split('The Details:')[1]?.split('Considerations:')[0];
    if (!detailsSection) return [];
    
    // Split by bullet points and filter out empty strings or whitespace-only strings
    return detailsSection
      .split('•')
      .slice(1) // Skip the first empty element before the first bullet point
      .map(detail => detail.trim())
      .filter(detail => detail.length > 0);
  };

  // Enhanced cleanHeader function to handle various bracket formats
  const cleanHeader = (header: string) => {
    let cleanedHeader = header.trim();
    cleanedHeader = cleanedHeader.replace(/^\s*\[(.*?)\]\s*$/, '$1').trim();
    cleanedHeader = cleanedHeader.replace(/[\[\]]/g, '').trim();
    return cleanedHeader;
  };

  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden max-w-2xl mx-auto mb-8">
      <header className="px-4 py-4 text-center">
        <h2 className="font-semibold text-lg text-primary mb-2">
          {cleanHeader(storybook?.header || application.title || 'Planning Application')}
        </h2>
        <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
          <MapPin className="h-4 w-4" />
          {application.address}
        </p>
      </header>

      <div className="relative w-full aspect-[4/3]">
        {typeof application.streetview_url === 'string' && application.streetview_url && (
          <img
            src={application.streetview_url}
            alt={storybook?.header || application.title || 'Planning application image'}
            className="w-full h-full object-cover rounded-lg"
          />
        )}
      </div>

      <div className="border-y border-gray-100 py-3 px-4">
        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => toast({
              title: "Coming soon!",
              description: "This feature will be available once you connect to Supabase.",
            })}
          >
            <ThumbsUp className="h-5 w-5" />
            <span className="text-xs">Hot</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => toast({
              title: "Coming soon!",
              description: "This feature will be available once you connect to Supabase.",
            })}
          >
            <ThumbsDown className="h-5 w-5" />
            <span className="text-xs">Not</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => toast({
              title: "Coming soon!",
              description: "This feature will be available once you connect to Supabase.",
            })}
          >
            <Heart className="h-5 w-5" />
            <span className="text-xs">Support</span>
          </Button>
          <div className="flex flex-col gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8"
              onClick={handleWhatsAppShare}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-4">
        {storybook?.content && (
          <div className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <div className="bg-primary/5 rounded-lg p-4">
                <h3 className="text-primary font-semibold mb-2">What's the Deal</h3>
                <div className="text-gray-700">
                  {parseHtmlContent(storybook.content.split('The Details:')[0])}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Key Details</h3>
              <div className="grid gap-4">
                {getKeyDetails(storybook.content).map((detail, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="min-w-[6px] min-h-[6px] w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-gray-700 flex-1">{parseHtmlContent(detail)}</p>
                  </div>
                ))}
              </div>
            </div>

            {storybook.content.includes('Nimbywatch:') && (
              <div className="bg-[#8B5CF6] text-white rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  🏘️ Nimbywatch
                </h3>
                <div className="space-y-2 text-white/90">
                  {storybook.content
                    .split('Nimbywatch:')[1]
                    .split('•')
                    .filter(Boolean)
                    .map((point, index) => (
                      <p key={index} className="text-sm">
                        {parseHtmlContent(point.trim())}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 mt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSeeOnMap}
            className="text-primary"
          >
            <MapPin className="w-4 h-4 mr-2" />
            See on map
          </Button>
        </div>
      </div>
    </article>
  );
};

