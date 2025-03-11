
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SupportButtonProps {
  applicationId: number;
  supportCount: number;
  checkAuth: (callback: () => void) => boolean;
}

export const SupportButton = ({ 
  applicationId, 
  supportCount, 
  checkAuth 
}: SupportButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSupportCount, setLocalSupportCount] = useState(supportCount);

  const handleSupport = async () => {
    if (!checkAuth(() => {})) return;
    // Support functionality not yet implemented
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      disabled={true} // Disabled until implemented
      className="flex flex-col items-center gap-1 h-auto py-2 hover:[&_svg]:text-[#ea384c] hover:[&_svg]:fill-[#ea384c]"
      onClick={() => checkAuth(() => handleSupport())}
    >
      <div className="relative">
        <Heart className="h-5 w-5" />
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
          {localSupportCount}
        </span>
      </div>
      <span className="text-xs">Support</span>
    </Button>
  );
};
