
import { Heart, MessageCircle, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";

interface CardActionsProps {
  applicationId: number;
  onShowComments: () => void;
  onShare: () => void;
}

export const CardActions = ({ applicationId, onShowComments, onShare }: CardActionsProps) => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [voteStatus, setVoteStatus] = useState<'hot' | 'not' | null>(null);
  const [commentsCount, setCommentsCount] = useState(0);
  const [supportCount, setSupportCount] = useState(0);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    const getVoteStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('application_votes')
        .select('vote_type')
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
        .maybeSingle();

      setVoteStatus(data?.vote_type || null);
    };

    const getCommentsCount = async () => {
      const { count } = await supabase
        .from('Comments')
        .select('*', { count: 'exact', head: true })
        .eq('application_id', applicationId);

      setCommentsCount(count || 0);
    };

    const getSupportCount = async () => {
      const { count } = await supabase
        .from('application_support')
        .select('*', { count: 'exact', head: true })
        .eq('application_id', applicationId);

      setSupportCount(count || 0);
    };

    getSession();
    getVoteStatus();
    getCommentsCount();
    getSupportCount();
  }, [applicationId, user]);

  const checkAuth = (callback: () => void) => {
    if (!user) {
      setShowAuthDialog(true);
      return false;
    }
    callback();
    return true;
  };

  const handleVote = async (type: 'hot' | 'not') => {
    if (!checkAuth(() => {})) return;

    try {
      if (voteStatus === type) {
        await supabase
          .from('application_votes')
          .delete()
          .eq('application_id', applicationId)
          .eq('user_id', user.id);
        setVoteStatus(null);
      } else {
        await supabase
          .from('application_votes')
          .upsert({
            application_id: applicationId,
            user_id: user.id,
            vote_type: type
          }, {
            onConflict: 'application_id,user_id'
          });
        setVoteStatus(type);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to save your vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSupport = async () => {
    if (!checkAuth(() => {})) return;

    try {
      const { data: existingSupport } = await supabase
        .from('application_support')
        .select('id')
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSupport) {
        await supabase
          .from('application_support')
          .delete()
          .eq('id', existingSupport.id);
        setSupportCount(prev => prev - 1);
      } else {
        await supabase
          .from('application_support')
          .insert({
            application_id: applicationId,
            user_id: user.id
          });
        setSupportCount(prev => prev + 1);
      }

      toast({
        title: existingSupport ? "Support removed" : "Support added",
        description: existingSupport 
          ? "You've removed your support for this application" 
          : "You're now supporting this application",
      });
    } catch (error) {
      console.error('Error toggling support:', error);
      toast({
        title: "Error",
        description: "Failed to update support status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCommentsClick = () => {
    setCommentsExpanded(!commentsExpanded);
    onShowComments();
  };

  const getCommentButtonText = () => {
    if (commentsCount === 0) {
      return 'Be the first to have your say';
    }
    return `Show comments${commentsCount > 0 ? ` (${commentsCount})` : ''}`;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="ghost" 
          size="sm"
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
          className={`flex flex-col items-center gap-1 h-auto py-2 ${
            voteStatus === 'not' ? 'text-primary bg-primary/10' : ''
          }`}
          onClick={() => checkAuth(() => handleVote('not'))}
        >
          <ThumbsDown className="h-5 w-5" />
          <span className="text-xs">Not</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-2 hover:[&_svg]:text-[#ea384c] hover:[&_svg]:fill-[#ea384c]"
          onClick={() => checkAuth(() => handleSupport())}
        >
          <div className="relative">
            <Heart className={`h-5 w-5 ${supportCount > 0 ? 'fill-[#ea384c] text-[#ea384c]' : ''}`} />
            {supportCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {supportCount}
              </span>
            )}
          </div>
          <span className="text-xs">Support</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="justify-start h-8 w-full"
          onClick={handleCommentsClick}
        >
          <div className="relative flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            {commentsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {commentsCount}
              </span>
            )}
            <span>{getCommentButtonText()}</span>
          </div>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="justify-start h-8"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </div>
  );
};
