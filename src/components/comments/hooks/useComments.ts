
import { useState, useEffect } from 'react';
import { Comment } from '@/types/planning';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useComments = (applicationId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>();
  const { toast } = useToast();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          setCurrentUserId(session.session.user.id);
        }

        const { data, error } = await supabase
          .from('Comments')
          .select('*, profiles:profiles(username)')
          .eq('application_id', applicationId)
          .is('parent_id', null)  // Only fetch top-level comments
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching comments:', error);
          toast({
            title: "Error",
            description: "Failed to load comments",
            variant: "destructive"
          });
          return;
        }

        setComments(data as Comment[]);
      } catch (error) {
        console.error('Error in fetchComments:', error);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();

    // Set up realtime subscription for comments
    const subscription = supabase
      .channel(`comments-${applicationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Comments',
        filter: `application_id=eq.${applicationId}`
      }, (payload) => {
        const newComment = payload.new as Comment;
        
        // Only add to our list if it's a top-level comment
        if (!newComment.parent_id) {
          setComments(prev => [newComment, ...prev]);
        }
      })
      .subscribe();

    // Auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id);
    });

    return () => {
      supabase.removeChannel(subscription);
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [applicationId, toast]);

  return { comments, isLoading, currentUserId, setComments };
};
