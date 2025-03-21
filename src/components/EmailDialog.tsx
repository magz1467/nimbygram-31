import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { EmailDialogForm } from "./email-dialog/EmailDialogForm"
import { useToast } from "@/components/ui/use-toast"

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (radius: string) => void;
  postcode: string;
}

export const EmailDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  postcode 
}: EmailDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (values: { radius: string }) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // First check if user already has an alert for this postcode
      const { data: existingAlert } = await supabase
        .from('user_postcodes')
        .select()
        .eq('user_id', user.id)
        .eq('postcode', postcode)
        .maybeSingle();

      if (existingAlert) {
        // Update existing alert
        const { error } = await supabase
          .from('user_postcodes')
          .update({
            radius: values.radius,
            User_email: user.email
          })
          .eq('id', existingAlert.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Your alert radius has been updated to ${values.radius === "1000" ? "1 kilometre" : values.radius + " metres"} for ${postcode}.`,
        });
      } else {
        // Create new alert
        const { error } = await supabase
          .from('user_postcodes')
          .insert({
            user_id: user.id,
            postcode: postcode,
            radius: values.radius,
            User_email: user.email
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: `You will now receive alerts for planning applications within ${values.radius === "1000" ? "1 kilometre" : values.radius + " metres"} of ${postcode}.`,
        });
      }

      await onSubmit(values.radius);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: "Error",
        description: "There was an error saving your preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-[2000] w-[calc(100%-2rem)] max-w-lg md:w-full"
        role="dialog"
        aria-labelledby="email-dialog-title"
        aria-describedby="email-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="email-dialog-title">Set up alerts for {postcode}</DialogTitle>
          <DialogDescription id="email-dialog-description">
            Choose how far from this postcode you want to receive alerts
          </DialogDescription>
        </DialogHeader>
        
        <EmailDialogForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};