
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const VotesTableSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableExists, setTableExists] = useState(false);
  const { toast } = useToast();

  const checkTableExists = async () => {
    try {
      const { error } = await supabase
        .from('application_votes')
        .select('count')
        .limit(1);
      
      if (error && error.code === '42P01') {
        // Table doesn't exist
        setTableExists(false);
        return false;
      }
      setTableExists(true);
      return true;
    } catch (error) {
      console.error('Error checking if table exists:', error);
      return false;
    }
  };

  // Check if table exists on component mount
  useState(() => {
    checkTableExists();
  });

  const createVotesTable = async () => {
    setIsLoading(true);
    
    try {
      const exists = await checkTableExists();
      
      if (exists) {
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
      
      setTableExists(true);
      
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
    <Card className={`p-6 ${!tableExists ? 'border-red-500' : 'border-green-500'}`}>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-bold">Application Votes Table Setup</h2>
        {tableExists ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : (
          <AlertCircle className="h-6 w-6 text-red-500" />
        )}
      </div>
      
      <p className="mb-4">
        {tableExists 
          ? "✅ The application_votes table is set up correctly."
          : "⚠️ The application voting system requires database setup. Without this, the Hot or Not feature will not work."}
      </p>
      
      {!tableExists && (
        <div className="bg-amber-50 p-3 rounded-md mb-4 border border-amber-200">
          <p className="text-amber-800 text-sm">
            The error message "Database setup required" appears because this table doesn't exist yet.
            Click the button below to create it.
          </p>
        </div>
      )}
      
      <Button 
        onClick={createVotesTable} 
        disabled={isLoading || tableExists}
        className="w-full"
        variant={tableExists ? "outline" : "default"}
      >
        {isLoading ? "Creating Table..." : tableExists ? "Table Already Created" : "Create Application Votes Table"}
      </Button>
    </Card>
  );
};
