
import { Application } from "@/types/planning";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSavedApplications } from "@/hooks/use-saved-applications";
import { EmailDialog } from "./EmailDialog";
import { FeedbackEmailDialog } from "./FeedbackEmailDialog";
import { AuthRequiredDialog } from "./AuthRequiredDialog";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ApplicationMetadata } from "./planning-details/ApplicationMetadata";
import { ApplicationActions } from "./planning-details/ApplicationActions";
import { ApplicationContent } from "./planning-details/ApplicationContent";

interface PlanningApplicationDetailsProps {
  application?: Application;
  onClose: () => void;
}

export const PlanningApplicationDetails = ({
  application,
  onClose,
}: PlanningApplicationDetailsProps) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [feedback, setFeedback] = useState<'yimby' | 'nimby' | null>(null);
  const [currentApplication, setCurrentApplication] = useState(application);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const { toast } = useToast();
  const { savedApplications, toggleSavedApplication } = useSavedApplications();

  // Fetch current user and application feedback
  useEffect(() => {
    const fetchUserAndFeedback = async () => {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        
        // If we have an application and user, fetch feedback
        if (application?.id && session.user.id) {
          const { data: feedbackData } = await supabase
            .from('application_feedback')
            .select('feedback_type')
            .eq('application_id', application.id)
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (feedbackData) {
            setFeedback(feedbackData.feedback_type as 'yimby' | 'nimby');
          }
        }
      }
    };
    
    fetchUserAndFeedback();
  }, [application]);

  useEffect(() => {
    console.log('PlanningApplicationDetails - Application Data:', {
      id: application?.id,
      class_3: application?.class_3,
      title: application?.title
    });
    
    setCurrentApplication(application);
    
    return () => {
      setShowEmailDialog(false);
      setShowFeedbackDialog(false);
      setShowAuthDialog(false);
      document.body.style.overflow = '';
    };
  }, [application]);

  if (!currentApplication) return null;

  const isSaved = savedApplications.includes(currentApplication.id);

  // Get feedback stats from application or provide defaults
  const feedbackStats = {
    yimbyCount: currentApplication?.feedback_stats?.yimby || (feedback === 'yimby' ? 13 : 12),
    nimbyCount: currentApplication?.feedback_stats?.nimby || (feedback === 'nimby' ? 4 : 3)
  };

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setShowAuthDialog(true);
      return;
    }

    toggleSavedApplication(currentApplication.id);
    toast({
      title: isSaved ? "Application removed" : "Application saved",
      description: isSaved 
        ? "The application has been removed from your saved list" 
        : "The application has been added to your saved list. View all your saved applications.",
      action: !isSaved ? (
        <Link to="/saved" className="text-primary hover:underline">
          View saved
        </Link>
      ) : undefined
    });
  };

  const handleEmailSubmit = (radius: string) => {
    toast({
      title: "Notification setup",
      description: `We'll notify you when a decision is made on this application.`,
      duration: 5000,
    });
    setShowEmailDialog(false);
  };

  const handleFeedbackEmailSubmit = (email: string) => {
    toast({
      title: "Developer verification pending",
      description: "We'll verify your email and send you access to view all feedback for this application.",
      duration: 5000,
    });
    setShowFeedbackDialog(false);
  };

  const handleFeedback = async (type: 'yimby' | 'nimby') => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      // Toggle feedback state (remove if clicking same option)
      const newFeedback = feedback === type ? null : type;
      setFeedback(newFeedback);
      
      // Toast message based on action
      toast({
        title: feedback === type ? "Feedback removed" : "Thank you for your feedback",
        description: feedback === type 
          ? "Your feedback has been removed"
          : type === 'yimby' 
            ? "Thanks for supporting new development!" 
            : "We understand your concerns",
      });
    } catch (error) {
      console.error('Error handling feedback:', error);
      toast({
        title: "Error",
        description: "Failed to save your feedback. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-4 pb-20">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <ApplicationMetadata 
            application={currentApplication}
            onShowEmailDialog={() => setShowEmailDialog(true)}
          />
        </div>
      </div>
      
      <ApplicationActions 
        applicationId={currentApplication.id}
        reference={currentApplication.reference}
        isSaved={isSaved}
        onSave={handleSave}
        onShowEmailDialog={() => setShowEmailDialog(true)}
      />

      <ApplicationContent 
        application={currentApplication}
        feedback={feedback}
        feedbackStats={feedbackStats}
        onFeedback={handleFeedback}
        userId={currentUser?.id}
      />

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Is this your development?</h3>
            <p className="text-sm text-gray-600">Click here to verify and see full feedback</p>
          </div>
          <Button variant="outline" onClick={() => setShowFeedbackDialog(true)}>
            Get feedback
          </Button>
        </div>
      </Card>

      <EmailDialog 
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        onSubmit={handleEmailSubmit}
        postcode={currentApplication?.postcode || ''}
      />

      <FeedbackEmailDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
        onSubmit={handleFeedbackEmailSubmit}
      />

      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </div>
  );
};
