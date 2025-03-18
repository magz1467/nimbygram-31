
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useState } from "react";

interface ShareButtonProps {
  onShare: () => void;
}

export const ShareButton = ({ onShare }: ShareButtonProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    // Call the original onShare handler for backward compatibility
    onShare();
    
    // Get the current URL which points to the listing
    const url = window.location.href;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this link to show this planning application to others.",
        duration: 3000,
      });
      setOpen(false); // Close the popover after copying
    } catch (err) {
      toast({
        title: "Couldn't copy link",
        description: "Please try again or copy the URL from your browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="justify-start h-8"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Share this application</h4>
          <p className="text-xs text-gray-500">
            Copy a direct link to this planning application
          </p>
          <Button 
            onClick={handleShare} 
            className="w-full mt-2"
            variant="default"
            size="sm"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Copy link
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
