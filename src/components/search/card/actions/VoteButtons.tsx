
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

interface VoteButtonsProps {
  applicationId: number;
  voteStatus: 'hot' | 'not' | null;
  hotCount: number;
  notCount: number;
  checkAuth: (callback: () => void) => boolean;
}

export const VoteButtons = ({ applicationId, voteStatus, hotCount, notCount, checkAuth }: VoteButtonsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localVoteStatus, setLocalVoteStatus] = useState<'hot' | 'not' | null>(voteStatus);
  const [localHotCount, setLocalHotCount] = useState(hotCount);
  const [localNotCount, setLocalNotCount] = useState(notCount);
  const [tableError, setTableError] = useState(false);
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    setLocalVoteStatus(voteStatus);
    setLocalHotCount(hotCount);
    setLocalNotCount(notCount);
  }, [voteStatus, hotCount, notCount]);

  // Check if the application_votes table exists
  useEffect(() => {
    const checkVotesTable = async () => {
      try {
        const { error } = await supabase
          .from('application_votes')
          .select('count')
          .limit(1);
        
        if (error && error.code === '42P01') {
          // Table doesn't exist
          setTableError(true);
        } else {
          setTableError(false);
        }
      } catch (error) {
        console.error('Error checking votes table:', error);
      }
    };
    
    checkVotesTable();
  }, []);

  const handleVote = async (type: 'hot' | 'not') => {
    if (!checkAuth(() => {})) return;
    if (isSubmitting) return;
    if (tableError) {
      toast({
        title: "Database setup required",
        description: "Please go to the Admin page to set up the voting system.",
        duration: 5000,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Store previous state to allow reversion if needed
      const previousVoteStatus = localVoteStatus;
      const previousHotCount = localHotCount;
      const previousNotCount = localNotCount;
      const isRemovingVote = localVoteStatus === type;
      
      // Update local state immediately for responsive UI
      if (isRemovingVote) {
        setLocalVoteStatus(null);
        if (type === 'hot') setLocalHotCount(prev => Math.max(0, prev - 1));
        if (type === 'not') setLocalNotCount(prev => Math.max(0, prev - 1));
      } else {
        // Switching vote or adding new vote
        if (localVoteStatus === 'hot' && type === 'not') {
          setLocalHotCount(prev => Math.max(0, prev - 1));
          setLocalNotCount(prev => prev + 1);
        } else if (localVoteStatus === 'not' && type === 'hot') {
          setLocalNotCount(prev => Math.max(0, prev - 1));
          setLocalHotCount(prev => prev + 1);
        } else if (localVoteStatus === null) {
          // New vote
          if (type === 'hot') setLocalHotCount(prev => prev + 1);
          if (type === 'not') setLocalNotCount(prev => prev + 1);
        }
        setLocalVoteStatus(type);
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        // Revert changes if user is not authenticated
        setLocalVoteStatus(previousVoteStatus);
        setLocalHotCount(previousHotCount);
        setLocalNotCount(previousNotCount);
        return;
      }

      // Check if the application_votes table exists
      const { error: tableCheckError } = await supabase
        .from('application_votes')
        .select('count')
        .limit(1);
      
      if (tableCheckError && tableCheckError.code === '42P01') {
        // Table doesn't exist error
        setLocalVoteStatus(previousVoteStatus);
        setLocalHotCount(previousHotCount);
        setLocalNotCount(previousNotCount);
        setTableError(true);
        
        toast({
          title: "Database setup required",
          description: "Please go to the Admin page to set up the voting system.",
          duration: 5000,
        });
        
        console.error('Error: application_votes table does not exist', tableCheckError);
        return;
      }

      if (isRemovingVote) {
        // Removing vote
        const { error } = await supabase
          .from('application_votes')
          .delete()
          .eq('application_id', applicationId)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error removing vote:', error);
          throw error;
        }
        
        toast({
          title: "Vote removed",
          description: "Your vote has been removed"
        });
      } else {
        // Adding or changing vote
        const { error } = await supabase
          .from('application_votes')
          .upsert({
            application_id: applicationId,
            user_id: user.id,
            vote_type: type
          }, {
            onConflict: 'application_id,user_id'
          });
          
        if (error) {
          console.error('Error saving vote:', error);
          throw error;
        }
        
        toast({
          title: "Vote recorded",
          description: `You voted this application as ${type === 'hot' ? 'hot' : 'not'}`
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Revert to server state on error
      setLocalVoteStatus(voteStatus);
      setLocalHotCount(hotCount);
      setLocalNotCount(notCount);
      
      toast({
        title: "Error",
        description: "Failed to save your vote. The application_votes table may not exist in the database.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tableError) {
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Database setup required</AlertTitle>
        <AlertDescription className="text-sm">
          <p>The voting feature requires database setup.</p>
          <Link to="/admin2" className="text-primary underline block mt-1">
            Go to Admin page to set up
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        disabled={isSubmitting}
        className={`flex flex-col items-center gap-1 h-auto py-2 rounded-md ${
          localVoteStatus === 'hot' ? 'text-primary bg-primary/10' : ''
        } hover:bg-[#F2FCE2] hover:text-primary transition-colors`}
        onClick={() => checkAuth(() => handleVote('hot'))}
      >
        <div className="relative">
          <ThumbsUp className="h-5 w-5" />
          {localHotCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
              {localHotCount}
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
          localVoteStatus === 'not' ? 'text-primary bg-primary/10' : ''
        }`}
        onClick={() => checkAuth(() => handleVote('not'))}
      >
        <div className="relative">
          <ThumbsDown className="h-5 w-5" />
          {localNotCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
              {localNotCount}
            </span>
          )}
        </div>
        <span className="text-xs">Not</span>
      </Button>
    </div>
  );
};
