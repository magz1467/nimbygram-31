import { Application } from "@/types/planning";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSavedApplications } from "@/hooks/use-saved-applications";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ApplicationMetadata } from "./planning-details/ApplicationMetadata";
import { ApplicationActions } from "./planning-details/ApplicationActions";
import { ApplicationContent } from "./planning-details/ApplicationContent";
import { ApplicationDialogs } from "./planning-details/ApplicationDialogs";
import { ApplicationFeedbackSection } from "./planning-details/ApplicationFeedbackSection";

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
  const { toast } = useToast();
  const { savedApplications, toggleSavedApplication } = useSavedApplications();

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

  const feedbackStats = {
    yimbyCount: feedback === 'yimby' ? 13 : 12,
    nimbyCount: feedback === 'nimby' ? 4 : 3
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

  const handleFeedback = (type: 'yimby' | 'nimby') => {
    setFeedback(prev => prev === type ? null : type);
    
    toast({
      title: type === feedback ? "Feedback removed" : "Thank you for your feedback",
      description: type === feedback 
        ? "Your feedback has been removed"
        : type === 'yimby' 
          ? "Thanks for supporting new development!" 
          : "We understand your concerns",
    });
  };

  return (
    <div className="p-6 space-y-4 pb-20">
      <div className="flex justify-between items-start pt-8">
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
      />

      <ApplicationFeedbackSection
        feedback={feedback}
        feedbackStats={feedbackStats}
        onFeedback={handleFeedback}
        applicationId={currentApplication.id}
      />

      <ApplicationDialogs
        showEmailDialog={showEmailDialog}
        setShowEmailDialog={setShowEmailDialog}
        showFeedbackDialog={showFeedbackDialog}
        setShowFeedbackDialog={setShowFeedbackDialog}
        showAuthDialog={showAuthDialog}
        setShowAuthDialog={setShowAuthDialog}
        onEmailSubmit={handleEmailSubmit}
        onFeedbackEmailSubmit={handleFeedbackEmailSubmit}
        postcode={currentApplication.postcode}
      />
    </div>
  );
};