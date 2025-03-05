
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface VoteButtonsProps {
  applicationId: number;
  voteStatus: 'hot' | 'not' | null;
  hotCount: number;
  notCount: number;
  checkAuth: (callback: () => void) => boolean;
}

export const VoteButtons = ({ applicationId, voteStatus, hotCount, notCount, checkAuth }: VoteButtonsProps) => {
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
      }
    } catch (error) {
      console.error('Error voting:', error);
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
        <div className="relative">
          <ThumbsUp className="h-5 w-5" />
          {hotCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
              {hotCount}
            </span>
          )}
        </div>
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
        <div className="relative">
          <ThumbsDown className="h-5 w-5" />
          {notCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
              {notCount}
            </span>
          )}
        </div>
        <span className="text-xs">Not</span>
      </Button>
    </div>
  );
};
