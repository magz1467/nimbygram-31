
import { Heart, MessageCircle, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

  const handleVote = async (type: 'hot' | 'not') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on applications",
        variant: "destructive"
      });
      return;
    }

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
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to support this application",
        variant: "destructive"
      });
      return;
    }

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

  return (
    <div className="grid grid-cols-4 gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        className={`flex flex-col items-center gap-1 h-auto py-2 ${
          voteStatus === 'hot' ? 'text-primary' : ''
        }`}
        onClick={() => handleVote('hot')}
      >
        <ThumbsUp className="h-5 w-5" />
        <span className="text-xs">Hot</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className={`flex flex-col items-center gap-1 h-auto py-2 ${
          voteStatus === 'not' ? 'text-primary' : ''
        }`}
        onClick={() => handleVote('not')}
      >
        <ThumbsDown className="h-5 w-5" />
        <span className="text-xs">Not</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className={`flex flex-col items-center gap-1 h-auto py-2`}
        onClick={handleSupport}
      >
        <div className="relative">
          <Heart className="h-5 w-5" />
          {supportCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {supportCount}
            </span>
          )}
        </div>
        <span className="text-xs">Support</span>
      </Button>
      <div className="flex flex-col gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8"
          onClick={onShowComments}
        >
          <div className="relative">
            <MessageCircle className="h-4 w-4 mr-2" />
            {commentsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {commentsCount}
              </span>
            )}
          </div>
          Comments
        </Button>
      </div>
    </div>
  );
};

