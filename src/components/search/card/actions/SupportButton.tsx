
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface SupportButtonProps {
  applicationId: number;
  supportCount: number;
  isSupportedByUser: boolean;
  checkAuth: (callback: () => void) => boolean;
}

export const SupportButton = ({ 
  applicationId, 
  supportCount, 
  isSupportedByUser, 
  checkAuth 
}: SupportButtonProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSupport = async () => {
    if (!checkAuth(() => {})) return;

    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isSupportedByUser) {
        // Remove support
        await supabase
          .from('application_support')
          .delete()
          .eq('application_id', applicationId)
          .eq('user_id', user.id);
        
        toast({
          title: "Support removed",
          description: "You've removed your support for this application",
        });
      } else {
        // Add support
        await supabase
          .from('application_support')
          .insert({
            application_id: applicationId,
            user_id: user.id
          });
        
        toast({
          title: "Support added",
          description: "You're now supporting this application",
        });
      }
    } catch (error) {
      console.error('Error toggling support:', error);
      toast({
        title: "Error",
        description: "Failed to update support status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      disabled={isSubmitting}
      className="flex flex-col items-center gap-1 h-auto py-2 hover:[&_svg]:text-[#ea384c] hover:[&_svg]:fill-[#ea384c]"
      onClick={() => checkAuth(() => handleSupport())}
    >
      <div className="relative">
        <Heart className={`h-5 w-5 ${isSupportedByUser ? 'fill-[#ea384c] text-[#ea384c]' : ''}`} />
        {supportCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {supportCount}
          </span>
        )}
      </div>
      <span className="text-xs">Support</span>
    </Button>
  );
};
