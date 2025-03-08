
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const VotesTableSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkTableExists = async () => {
    try {
      const { error } = await supabase
        .from('application_votes')
        .select('count')
        .limit(1);
      
      if (error && error.code === '42P01') {
        // Table doesn't exist
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking if table exists:', error);
      return false;
    }
  };

  const createVotesTable = async () => {
    setIsLoading(true);
    
    try {
      const tableExists = await checkTableExists();
      
      if (tableExists) {
        toast({
          title: "Table exists",
          description: "The application_votes table already exists in the database."
        });
        return;
      }
      
      // Use the Supabase function to create the table
      const { data, error } = await supabase.functions.invoke('create-votes-table');
      
      if (error) {
        console.error('Error creating table:', error);
        toast({
          title: "Error",
          description: "Failed to create the application_votes table. See console for details.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "The application_votes table has been created successfully."
      });
      
      // Refresh the page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error in createVotesTable:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. See console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Application Votes Table Setup</h2>
      <p className="mb-4">
        This utility creates the required database table for the application voting system.
        Use this if you're seeing errors related to the "application_votes" table not existing.
      </p>
      <Button 
        onClick={createVotesTable} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Creating Table..." : "Create Application Votes Table"}
      </Button>
    </Card>
  );
};
