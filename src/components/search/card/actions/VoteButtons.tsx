
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface VoteButtonsProps {
  applicationId: number;
  voteStatus: 'hot' | 'not' | null;
  checkAuth: (callback: () => void) => boolean;
}

export const VoteButtons = ({ applicationId, voteStatus, checkAuth }: VoteButtonsProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (type: 'hot' | 'not') => {
    if (!checkAuth(() => {})) return;

    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (voteStatus === type) {
        // Removing vote
        await supabase
          .from('application_votes')
          .delete()
          .eq('application_id', applicationId)
          .eq('user_id', user.id);
        
        toast({
          title: "Vote removed",
          description: `You no longer voted on this application`,
        });
      } else {
        // Adding or changing vote
        await supabase
          .from('application_votes')
          .upsert({
            application_id: applicationId,
            user_id: user.id,
            vote_type: type
          }, {
            onConflict: 'application_id,user_id'
          });
        
        toast({
          title: "Vote recorded",
          description: `You've marked this application as ${type}`,
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to save your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        disabled={isSubmitting}
        className={`flex flex-col items-center gap-1 h-auto py-2 rounded-md ${
          voteStatus === 'hot' ? 'text-primary bg-primary/10' : ''
        } hover:bg-[#F2FCE2] hover:text-primary transition-colors`}
        onClick={() => checkAuth(() => handleVote('hot'))}
      >
        <ThumbsUp className="h-5 w-5" />
        <span className="text-xs">Hot</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        disabled={isSubmitting}
        className={`flex flex-col items-center gap-1 h-auto py-2 ${
          voteStatus === 'not' ? 'text-primary bg-primary/10' : ''
        }`}
        onClick={() => checkAuth(() => handleVote('not'))}
      >
        <ThumbsDown className="h-5 w-5" />
        <span className="text-xs">Not</span>
      </Button>
    </div>
  );
};
