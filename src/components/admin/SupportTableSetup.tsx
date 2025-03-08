
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const SupportTableSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableExists, setTableExists] = useState(false);
  const { toast } = useToast();

  const checkTableExists = async () => {
    try {
      const { error } = await supabase
        .from('application_support')
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

  const createSupportTable = async () => {
    setIsLoading(true);
    
    try {
      const exists = await checkTableExists();
      
      if (exists) {
        toast({
          title: "Table exists",
          description: "The application_support table already exists in the database."
        });
        return;
      }
      
      // Create the table directly with SQL query using RPC
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS application_support (
          id SERIAL PRIMARY KEY,
          application_id INTEGER NOT NULL,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(application_id, user_id)
        );

        -- Add RLS policies
        ALTER TABLE application_support ENABLE ROW LEVEL SECURITY;

        -- Allow authenticated users to select their own support records
        CREATE POLICY "Users can view their own support records" 
          ON application_support FOR SELECT 
          USING (auth.uid() = user_id);

        -- Allow authenticated users to select any support records (for counting)
        CREATE POLICY "Users can view any support records" 
          ON application_support FOR SELECT 
          USING (true);

        -- Allow authenticated users to insert their own support records
        CREATE POLICY "Users can insert their own support records" 
          ON application_support FOR INSERT 
          WITH CHECK (auth.uid() = user_id);

        -- Allow authenticated users to delete their own support records
        CREATE POLICY "Users can delete their own support records" 
          ON application_support FOR DELETE
          USING (auth.uid() = user_id);

        -- Grant access to authenticated users
        GRANT ALL ON application_support TO authenticated;
        GRANT USAGE, SELECT ON SEQUENCE application_support_id_seq TO authenticated;
      `;

      const { error } = await supabase.rpc('exec_sql', { query: createTableQuery });
      
      if (error) {
        console.error('Error creating table:', error);
        toast({
          title: "Error",
          description: "Failed to create the application_support table. See console for details.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "The application_support table has been created successfully."
      });
      
      setTableExists(true);
      
      // Refresh the page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error in createSupportTable:', error);
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
        <h2 className="text-xl font-bold">Application Support Table Setup</h2>
        {tableExists ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : (
          <AlertCircle className="h-6 w-6 text-red-500" />
        )}
      </div>
      
      <p className="mb-4">
        {tableExists 
          ? "✅ The application_support table is set up correctly."
          : "⚠️ The application support system requires database setup. Without this, the Support feature will not work."}
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
        onClick={createSupportTable} 
        disabled={isLoading || tableExists}
        className="w-full"
        variant={tableExists ? "outline" : "default"}
      >
        {isLoading ? "Creating Table..." : tableExists ? "Table Already Created" : "Create Application Support Table"}
      </Button>
    </Card>
  );
};
