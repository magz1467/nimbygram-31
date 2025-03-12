
import { Button } from "@/components/ui/button";
import { HeartIcon } from "lucide-react";
import { useState } from "react";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "@/hooks/use-error-handler";

export interface SupportButtonProps {
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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { handleError, isNonCritical } = useErrorHandler();
  
  const handleSupport = async () => {
    const canProceed = checkAuth(() => setShowAuthDialog(true));
    if (!canProceed) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if support_count column exists
      const { data: columnExists, error: columnCheckError } = await supabase.rpc(
        'check_column_exists',
        { table_name: 'crystal_roof', column_name: 'support_count' }
      );
      
      if (columnCheckError) {
        console.error('Error checking column exists:', columnCheckError);
        toast({
          title: "Feature unavailable",
          description: "The support feature is currently being set up. Please try again later.",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!columnExists) {
        toast({
          title: "Feature unavailable",
          description: "The support feature is currently being set up. Please try again later.",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Toggle support status
      const newCount = isSupportedByUser ? supportCount - 1 : supportCount + 1;
      
      const { error } = await supabase
        .from('crystal_roof')
        .update({ support_count: newCount })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      toast({
        title: isSupportedByUser ? "Support removed" : "Application supported",
        description: isSupportedByUser 
          ? "You're no longer supporting this application" 
          : "You're now supporting this application",
      });
      
    } catch (error) {
      // Only show errors if they're not related to the missing column
      if (!isNonCritical(error)) {
        handleError(error, {
          context: 'support button',
          retry: () => handleSupport()
        });
      } else {
        // For non-critical errors, show a more user-friendly message
        toast({
          title: "Feature unavailable",
          description: "The support feature is currently unavailable. Please try again later.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSupport}
        disabled={isSubmitting}
        className={`text-gray-700 hover:bg-gray-100 ${isSupportedByUser ? 'text-red-500' : ''}`}
      >
        <HeartIcon className={`mr-1 h-4 w-4 ${isSupportedByUser ? 'fill-red-500 text-red-500' : ''}`} />
        <span>{supportCount}</span>
      </Button>
      
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </>
  );
};
