
import { Application } from "@/types/planning";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { useState } from "react";
import { ImageResolver } from "./components/ImageResolver";
import { StatusBadge } from "./components/StatusBadge";

interface MobileListViewProps {
  postcode: string;
  applications: Application[];
  selectedApplication?: number | null;
  onSelectApplication: (id: number) => void;
  onShowEmailDialog: () => void;
  hideFilterBar?: boolean;
  onClose?: () => void;
}

const formatStorybook = (content: string | null) => {
  if (!content) return null;

  // Extract header if it exists
  const headerMatch = content.match(/<header>(.*?)<\/header>/);
  let header = headerMatch ? headerMatch[1].replace(/[\[\]]/g, '').trim() : null;
  
  // Remove header tags and content from the main content
  let bodyContent = content.replace(/<header>.*?<\/header>/g, '').trim();

  // Remove any occurrence of the header from the start of the content
  if (header) {
    // Escape special characters in the header for regex
    const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Remove the header if it appears at the start (case insensitive)
    bodyContent = bodyContent.replace(new RegExp(`^${escapedHeader}`, 'i'), '').trim();
    // Also try removing with "What's the Deal:" prefix
    bodyContent = bodyContent.replace(new RegExp(`^What's the Deal:\\s*${escapedHeader}`, 'i'), '').trim();
  }

  // Remove markdown heading indicators (##)
  bodyContent = bodyContent.replace(/^##\s*/gm, '');

  // Convert asterisk list items to bullet points
  bodyContent = bodyContent.replace(/^\*\s/gm, '• ');

  // Format bold text
  const formattedContent = bodyContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return { header, content: formattedContent };
};

export const MobileListView = ({
  postcode,
  applications,
  selectedApplication,
  onSelectApplication,
  onShowEmailDialog,
  hideFilterBar,
  onClose
}: MobileListViewProps) => {
  const [showAlerts, setShowAlerts] = useState(true);

  return (
    <div className="absolute inset-0 flex flex-col h-full max-h-[100dvh] overflow-hidden bg-gray-50">
      {showAlerts && (
        <div className="p-4 bg-white border-b relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 h-8 w-8"
            onClick={() => setShowAlerts(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Get Updates for This Area</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Stay informed about new planning applications near {postcode}
            </p>
            <Button 
              className="w-full"
              onClick={onShowEmailDialog}
            >
              Get Alerts
            </Button>
          </div>
        </div>
      )}
      <div className="p-4 space-y-4 overflow-y-auto">
        {applications.map((app) => {
          const storybook = formatStorybook(app.storybook);
          
          return (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
              onClick={() => onSelectApplication(app.id)}
            >
              <div className="flex flex-col">
                <div className="w-full aspect-[4/3] relative">
                  <ImageResolver
                    imageMapUrl={app.image_map_url}
                    image={app.image}
                    title={app.title || app.description || ''}
                    applicationId={app.id}
                    coordinates={app.coordinates}
                    class_3={app.category}
                  />
                </div>
                <div className="p-4">
                  {storybook?.header ? (
                    <h3 className="font-semibold text-primary text-lg mb-2">
                      {storybook.header}
                    </h3>
                  ) : (
                    <h3 className="font-semibold text-primary">
                      {app.title || 'Planning Application'}
                    </h3>
                  )}
                  {storybook?.content && (
                    <div 
                      className="text-sm text-gray-600 mt-1 whitespace-pre-line leading-relaxed space-y-2"
                      dangerouslySetInnerHTML={{ 
                        __html: storybook.content
                      }}
                    />
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <StatusBadge status={app.status} />
                    {app.distance && <span className="text-xs text-gray-500">{app.distance}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
