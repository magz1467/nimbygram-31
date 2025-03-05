
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [localFeedback, setLocalFeedback] = useState(feedback);
  const [localStats, setLocalStats] = useState(feedbackStats);

  // Update local state when props change
  useEffect(() => {
    setLocalFeedback(feedback);
    setLocalStats(feedbackStats);
  }, [feedback, feedbackStats]);

  const handleFeedbackClick = (type: 'yimby' | 'nimby') => {
    // Previous state
    const prevFeedback = localFeedback;
    const prevStats = { ...localStats };
    
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
    try {
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
    }
  };

  if (isMobile) {
    return (
      <Card className="p-4 hover:border-primary transition-colors">
        <h3 className="font-semibold mb-4 text-lg text-center">🔥 Hot or Not? Vote now!</h3>
        <div className="flex justify-between gap-2">
          <Button
            variant={localFeedback === 'yimby' ? "default" : "outline"}
            onClick={() => handleFeedbackClick('yimby')}
            className={`flex items-center gap-2 flex-1 hover:scale-105 transition-transform ${
              localFeedback === 'yimby' ? 'bg-primary hover:bg-primary-dark' : 'hover:bg-primary/10'
            }`}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary transition-all">
              <ImageWithFallback
                src="/lovable-uploads/3df4c01a-a60f-43c5-892a-18bf170175b6.png"
                alt="YIMBY"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-semibold">{localStats.yimbyCount}</span>
          </Button>
          <Button
            variant={localFeedback === 'nimby' ? "outline" : "outline"}
            onClick={() => handleFeedbackClick('nimby')}
            className={`flex items-center gap-2 flex-1 hover:scale-105 transition-transform ${
              localFeedback === 'nimby' ? 'bg-[#ea384c]/10' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-[#ea384c] transition-all">
              <ImageWithFallback
                src="/lovable-uploads/4dfbdd6f-07d8-4c20-bd77-0754d1f78644.png"
                alt="NIMBY"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-semibold">{localStats.nimbyCount}</span>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:border-primary transition-colors">
      <h3 className="font-semibold mb-4 text-xl text-center">🔥 Hot or Not? Vote now!</h3>
      <div className="flex gap-4">
        <Button
          variant={localFeedback === 'yimby' ? "default" : "outline"}
          onClick={() => handleFeedbackClick('yimby')}
          className={`flex-1 flex items-center gap-3 justify-start h-auto p-3 hover:scale-105 transition-transform ${
            localFeedback === 'yimby' ? 'bg-primary hover:bg-primary-dark' : 'hover:bg-primary/10'
          }`}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary transition-all">
            <ImageWithFallback
              src="/lovable-uploads/3df4c01a-a60f-43c5-892a-18bf170175b6.png"
              alt="YIMBY"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-lg font-semibold">{localStats.yimbyCount}</span>
            <span className={`text-sm ${
              localFeedback === 'yimby' ? 'text-white' : 'text-gray-500'
            }`}>people said YES!</span>
          </div>
        </Button>
        <Button
          variant={localFeedback === 'nimby' ? "outline" : "outline"}
          onClick={() => handleFeedbackClick('nimby')}
          className={`flex-1 flex items-center gap-3 justify-start h-auto p-3 hover:scale-105 transition-transform ${
            localFeedback === 'nimby' ? 'bg-[#ea384c]/10' : ''
          }`}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-[#ea384c] transition-all">
            <ImageWithFallback
              src="/lovable-uploads/4dfbdd6f-07d8-4c20-bd77-0754d1f78644.png"
              alt="NIMBY"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-lg font-semibold">{localStats.nimbyCount}</span>
            <span className="text-sm text-gray-500">people said NO!</span>
          </div>
        </Button>
      </div>
    </Card>
  );
};
