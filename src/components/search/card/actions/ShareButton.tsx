
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  onShare: () => void;
}

export const ShareButton = ({ onShare }: ShareButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="justify-start h-8"
      onClick={onShare}
    >
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
};
