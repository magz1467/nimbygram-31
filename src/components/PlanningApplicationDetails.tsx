import React from 'react';
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

interface Document {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface Location {
  lat: number;
  lng: number;
}

interface PlanningApplication {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  address: string;
  applicant: string;
  reference: string;
  documents: Document[];
  location: Location;
  imageUrl: string | null;
}

interface PlanningApplicationDetailsProps {
  application: PlanningApplication;
  isLoading?: boolean;
  error?: string | null;
}

export const PlanningApplicationDetails: React.FC<PlanningApplicationDetailsProps> = ({
  application,
  isLoading = false,
  error = null
}) => {
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

  if (isLoading) {
    return <div className="loading">Loading application details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

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

  // Format date for display
  const formattedDate = new Date(currentApplication.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Determine status class for styling
  const getStatusClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'status-approved';
    if (statusLower === 'rejected') return 'status-rejected';
    return 'status-pending';
  };

  const statusClass = getStatusClass(currentApplication.status);

  return (
    <div className="planning-application-details">
      <div className="header">
        <h1>{currentApplication.title}</h1>
        <div className="meta">
          <span className={`status ${statusClass}`}>{currentApplication.status}</span>
          <span className="date">Submitted on {formattedDate}</span>
          <span className="reference">Ref: {currentApplication.reference}</span>
        </div>
      </div>

      <div className="content">
        <div className="main-info">
          <h2>Description</h2>
          <p>{currentApplication.description}</p>

          <h2>Location</h2>
          <p className="address">{currentApplication.address}</p>

          <h2>Applicant</h2>
          <p>{currentApplication.applicant}</p>
        </div>

        <div className="documents">
          <h2>Documents</h2>
          {currentApplication.documents.length > 0 ? (
            <ul>
              {currentApplication.documents.map(doc => (
                <li key={doc.id}>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    {doc.title} ({doc.type})
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No documents available</p>
          )}
        </div>
      </div>

      {currentApplication.imageUrl && (
        <div className="image">
          <img src={currentApplication.imageUrl} alt={currentApplication.title} />
        </div>
      )}

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
