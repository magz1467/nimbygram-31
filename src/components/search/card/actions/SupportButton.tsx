
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSupportCount, setLocalSupportCount] = useState(supportCount);
  const [localIsSupported, setLocalIsSupported] = useState(isSupportedByUser);
  const { toast } = useToast();

  const handleSupport = async () => {
    if (!checkAuth(() => {})) return;
    if (isSubmitting) return;

    // Store previous state to revert in case of error
    const prevIsSupported = localIsSupported;
    const prevSupportCount = localSupportCount;

    try {
      setIsSubmitting(true);
      
      // Optimistic UI update
      if (localIsSupported) {
        setLocalSupportCount(prev => Math.max(0, prev - 1));
        setLocalIsSupported(false);
      } else {
        setLocalSupportCount(prev => prev + 1);
        setLocalIsSupported(true);
      }

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        // Reset UI if user not authenticated
        setLocalSupportCount(supportCount);
        setLocalIsSupported(isSupportedByUser);
        return;
      }

      if (prevIsSupported) {
        // Remove support
        const { error } = await supabase
          .from('application_support')
          .delete()
          .eq('application_id', applicationId)
          .eq('user_id', user.id);
          
        if (error) {
          if (error.code === '42P01') {
            // Table doesn't exist
            throw new Error('The application_support table does not exist. Please visit the Admin page to set it up.');
          }
          throw error;
        }
        
        toast({
          title: "Support removed",
          description: "Your support has been removed."
        });
      } else {
        // Add support
        const { error } = await supabase
          .from('application_support')
          .insert({
            application_id: applicationId,
            user_id: user.id
          });
          
        if (error) {
          if (error.code === '42P01') {
            // Table doesn't exist
            throw new Error('The application_support table does not exist. Please visit the Admin page to set it up.');
          }
          throw error;
        }
        
        toast({
          title: "Support added",
          description: "You are now supporting this application."
        });
      }
    } catch (error) {
      console.error('Error toggling support:', error);
      
      // Revert to previous state on error
      setLocalIsSupported(prevIsSupported);
      setLocalSupportCount(prevSupportCount);
      
      let errorMessage = "Failed to update support. Please try again.";
      if (error instanceof Error && error.message.includes('application_support table does not exist')) {
        errorMessage = "The support feature is not set up yet. Please contact an administrator.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
        <Heart className={`h-5 w-5 ${localIsSupported ? 'fill-[#ea384c] text-[#ea384c]' : ''}`} />
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
          {localSupportCount}
        </span>
      </div>
      <span className="text-xs">Support</span>
    </Button>
  );
};
