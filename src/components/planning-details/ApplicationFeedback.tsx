
import { FeedbackCard } from "./feedback/FeedbackCard";
import { FeedbackHeader } from "./feedback/FeedbackHeader";
import { FeedbackButtons } from "./feedback/FeedbackButtons";
import { useFeedbackState } from "./feedback/useFeedbackState";

interface ApplicationFeedbackProps {
  feedback: 'yimby' | 'nimby' | null;
  onFeedback: (type: 'yimby' | 'nimby') => void;
  feedbackStats: {
    yimbyCount: number;
    nimbyCount: number;
  };
}

export const ApplicationFeedback = ({ 
  feedback, 
  onFeedback,
  feedbackStats 
}: ApplicationFeedbackProps) => {
  const { 
    feedback: localFeedback,
    stats: localStats,
    isSubmitting,
    handleFeedbackClick
  } = useFeedbackState(feedback, feedbackStats, onFeedback);

  return (
    <FeedbackCard>
      <FeedbackHeader />
      <FeedbackButtons
        feedback={localFeedback}
        stats={localStats}
        isSubmitting={isSubmitting}
        onFeedbackClick={handleFeedbackClick}
      />
    </FeedbackCard>
  );
};
