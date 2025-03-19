import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWebSocketConnection } from './use-websocket-connection';
import { Comment } from '@/types/planning';

export const useRealtimeComments = (applicationId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch initial comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('Comments')
          .select('*, profiles:profiles(username)')
          .eq('application_id', applicationId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load comments',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      fetchComments();
    }
  }, [applicationId, toast]);

  // Handle new comments via WebSocket
  const handleNewComment = useCallback((payload: any) => {
    const newComment = payload.new as Comment;
    if (newComment && newComment.application_id === applicationId) {
      setComments(prevComments => [newComment, ...prevComments]);
    }
  }, [applicationId]);

  // Set up WebSocket connection
  const { isConnected } = useWebSocketConnection(
    {
      event: 'INSERT',
      schema: 'public',
      table: 'Comments',
      filter: `application_id=eq.${applicationId}`
    },
    handleNewComment
  );

  // Add new comment
  const addComment = useCallback(async (content: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('Comments')
        .insert([
          {
            comment: content,
            application_id: applicationId,
            user_id: session.user.id,
            user_email: session.user.email
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive'
      });
      return null;
    }
  }, [applicationId, toast]);

  return {
    comments,
    isLoading,
    isConnected,
    addComment
  };
};
