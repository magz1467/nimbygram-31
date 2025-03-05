import { Heart, MessageCircle, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import { Textarea } from "@/components/ui/textarea";

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
  const [isSupportedByUser, setIsSupportedByUser] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showInlineCommentForm, setShowInlineCommentForm] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    getSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      // Clean up the listener when component unmounts
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Fetch user's vote status
    const getVoteStatus = async () => {
      const { data } = await supabase
        .from('application_votes')
        .select('vote_type')
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
        .maybeSingle();

      setVoteStatus(data?.vote_type || null);
    };

    // Fetch user's support status
    const getSupportStatus = async () => {
      const { data } = await supabase
        .from('application_support')
        .select('id')
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsSupportedByUser(!!data);
    };

    getVoteStatus();
    getSupportStatus();
  }, [applicationId, user]);

  useEffect(() => {
    // Fetch comments count
    const getCommentsCount = async () => {
      const { count } = await supabase
        .from('Comments')
        .select('*', { count: 'exact', head: true })
        .eq('application_id', applicationId);

      setCommentsCount(count || 0);
    };

    // Fetch support count
    const getSupportCount = async () => {
      const { count } = await supabase
        .from('application_support')
        .select('*', { count: 'exact', head: true })
        .eq('application_id', applicationId);

      setSupportCount(count || 0);
    };

    getCommentsCount();
    getSupportCount();

    // Set up realtime subscriptions
    const commentsSubscription = supabase
      .channel('Comments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Comments',
        filter: `application_id=eq.${applicationId}`
      }, () => {
        getCommentsCount();
      })
      .subscribe();

    const supportSubscription = supabase
      .channel('support-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'application_support',
        filter: `application_id=eq.${applicationId}`
      }, () => {
        getSupportCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(supportSubscription);
    };
  }, [applicationId]);

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
        // Removing vote
        await supabase
          .from('application_votes')
          .delete()
          .eq('application_id', applicationId)
          .eq('user_id', user.id);
        setVoteStatus(null);
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
        setVoteStatus(type);
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
    }
  };

  const handleSupport = async () => {
    if (!checkAuth(() => {})) return;

    try {
      if (isSupportedByUser) {
        // Remove support
        await supabase
          .from('application_support')
          .delete()
          .eq('application_id', applicationId)
          .eq('user_id', user.id);
        setIsSupportedByUser(false);
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
        setIsSupportedByUser(true);
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
    }
  };

  const handleCommentsClick = () => {
    if (commentsCount === 0) {
      // If there are no comments, check if user is authenticated
      if (!user) {
        setShowAuthDialog(true);
        return;
      }
      
      // Show inline comment form for first comment
      setShowInlineCommentForm(!showInlineCommentForm);
    } else {
      // Otherwise toggle comment visibility
      onShowComments();
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !user) return;
    
    setIsSubmittingComment(true);
    try {
      const { data: newComment, error } = await supabase
        .from('Comments')
        .insert({
          comment: commentText.trim(),
          application_id: applicationId,
          user_id: user.id,
          user_email: user.email,
          upvotes: 0,
          downvotes: 0
        })
        .select('*')
        .single();

      if (error) throw error;

      setCommentText('');
      setShowInlineCommentForm(false);
      onShowComments(); // Show all comments after submitting
      
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
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
            <Heart className={`h-5 w-5 ${isSupportedByUser ? 'fill-[#ea384c] text-[#ea384c]' : ''}`} />
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

        {showInlineCommentForm && (
          <div className="mt-2 space-y-2">
            <Textarea
              placeholder="Write your comment here..."
              className="min-h-[80px] text-sm"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowInlineCommentForm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={submitComment}
                disabled={!commentText.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        )}

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
