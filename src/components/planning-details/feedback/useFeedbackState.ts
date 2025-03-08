
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackState {
  feedback: 'yimby' | 'nimby' | null;
  stats: {
    yimbyCount: number;
    nimbyCount: number;
  };
  isSubmitting: boolean;
  handleFeedbackClick: (type: 'yimby' | 'nimby') => void;
}

export const useFeedbackState = (
  initialFeedback: 'yimby' | 'nimby' | null,
  initialStats: { yimbyCount: number; nimbyCount: number },
  onFeedback: (type: 'yimby' | 'nimby') => void
): FeedbackState => {
  const { toast } = useToast();
  const [localFeedback, setLocalFeedback] = useState(initialFeedback);
  const [localStats, setLocalStats] = useState(initialStats);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalFeedback(initialFeedback);
    setLocalStats(initialStats);
  }, [initialFeedback, initialStats]);

  const handleFeedbackClick = (type: 'yimby' | 'nimby') => {
    if (isSubmitting) return;
    
    // Previous state
    const prevFeedback = localFeedback;
    const prevStats = { ...localStats };
    
    try {
      setIsSubmitting(true);
      
      // Apply optimistic update
      const isRemovingFeedback = localFeedback === type;
      
      // Update local state immediately for responsive UI
      if (isRemovingFeedback) {
        setLocalFeedback(null);
        if (type === 'yimby') {
          setLocalStats(prev => ({
            ...prev,
            yimbyCount: Math.max(0, prev.yimbyCount - 1)
          }));
        } else {
          setLocalStats(prev => ({
            ...prev,
            nimbyCount: Math.max(0, prev.nimbyCount - 1)
          }));
        }
      } else {
        // Switching feedback or adding new feedback
        if (localFeedback === 'yimby' && type === 'nimby') {
          setLocalStats({
            yimbyCount: Math.max(0, localStats.yimbyCount - 1),
            nimbyCount: localStats.nimbyCount + 1
          });
        } else if (localFeedback === 'nimby' && type === 'yimby') {
          setLocalStats({
            yimbyCount: localStats.yimbyCount + 1,
            nimbyCount: Math.max(0, localStats.nimbyCount - 1)
          });
        } else if (localFeedback === null) {
          // New feedback
          if (type === 'yimby') {
            setLocalStats(prev => ({
              ...prev,
              yimbyCount: prev.yimbyCount + 1
            }));
          } else {
            setLocalStats(prev => ({
              ...prev,
              nimbyCount: prev.nimbyCount + 1
            }));
          }
        }
        setLocalFeedback(type);
      }
      
      // Call the parent handler to update the database
      onFeedback(type);
    } catch (error) {
      // Revert on error
      setLocalFeedback(prevFeedback);
      setLocalStats(prevStats);
      
      toast({
        title: "Error",
        description: "Failed to save your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    feedback: localFeedback,
    stats: localStats,
    isSubmitting,
    handleFeedbackClick
  };
};
