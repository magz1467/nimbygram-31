
import { useIsMobile } from "@/hooks/use-mobile";
import { VoteButton } from "./VoteButton";

interface FeedbackButtonsProps {
  feedback: 'yimby' | 'nimby' | null;
  stats: {
    yimbyCount: number;
    nimbyCount: number;
  };
  isSubmitting: boolean;
  onFeedbackClick: (type: 'yimby' | 'nimby') => void;
}

export const FeedbackButtons = ({
  feedback,
  stats,
  isSubmitting,
  onFeedbackClick
}: FeedbackButtonsProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex justify-between gap-2">
        <VoteButton
          type="yimby"
          count={stats.yimbyCount}
          isActive={feedback === 'yimby'}
          imageSrc="/lovable-uploads/3df4c01a-a60f-43c5-892a-18bf170175b6.png"
          onClick={() => onFeedbackClick('yimby')}
          isSubmitting={isSubmitting}
          isMobile={true}
        />
        <VoteButton
          type="nimby"
          count={stats.nimbyCount}
          isActive={feedback === 'nimby'}
          imageSrc="/lovable-uploads/4dfbdd6f-07d8-4c20-bd77-0754d1f78644.png"
          onClick={() => onFeedbackClick('nimby')}
          isSubmitting={isSubmitting}
          isMobile={true}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <VoteButton
        type="yimby"
        count={stats.yimbyCount}
        isActive={feedback === 'yimby'}
        imageSrc="/lovable-uploads/3df4c01a-a60f-43c5-892a-18bf170175b6.png"
        onClick={() => onFeedbackClick('yimby')}
        isSubmitting={isSubmitting}
        isMobile={false}
      />
      <VoteButton
        type="nimby"
        count={stats.nimbyCount}
        isActive={feedback === 'nimby'}
        imageSrc="/lovable-uploads/4dfbdd6f-07d8-4c20-bd77-0754d1f78644.png"
        onClick={() => onFeedbackClick('nimby')}
        isSubmitting={isSubmitting}
        isMobile={false}
      />
    </div>
  );
};
