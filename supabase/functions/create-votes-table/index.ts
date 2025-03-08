
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createSupabaseClient } from '../_shared/supabase-client.ts'

serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const supabase = createSupabaseClient()

    // Check if application_votes table exists
    const { data: tables, error: checkError } = await supabase.rpc('get_tables')
    
    if (checkError) {
      console.error('Error checking tables:', checkError)
      return new Response(
        JSON.stringify({ error: 'Failed to check if table exists', details: checkError }),
        { headers, status: 500 }
      )
    }

    const tableExists = tables.some((table: any) => table.table_name === 'application_votes')
    
    // If table doesn't exist, create it
    if (!tableExists) {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS application_votes (
          id SERIAL PRIMARY KEY,
          application_id INTEGER NOT NULL,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          vote_type TEXT NOT NULL CHECK (vote_type IN ('hot', 'not')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(application_id, user_id)
        );

        -- Add RLS policies
        ALTER TABLE application_votes ENABLE ROW LEVEL SECURITY;

        -- Allow authenticated users to select their own votes
        CREATE POLICY "Users can view their own votes" 
          ON application_votes FOR SELECT 
          USING (auth.uid() = user_id);

        -- Allow authenticated users to insert their own votes
        CREATE POLICY "Users can insert their own votes" 
          ON application_votes FOR INSERT 
          WITH CHECK (auth.uid() = user_id);

        -- Allow authenticated users to update their own votes
        CREATE POLICY "Users can update their own votes" 
          ON application_votes FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);

        -- Allow authenticated users to delete their own votes
        CREATE POLICY "Users can delete their own votes" 
          ON application_votes FOR DELETE
          USING (auth.uid() = user_id);

        -- Grant access to authenticated users
        GRANT ALL ON application_votes TO authenticated;
        GRANT USAGE, SELECT ON SEQUENCE application_votes_id_seq TO authenticated;
      `

      const { error: createError } = await supabase.rpc('exec_sql', { query: createTableQuery })
      
      if (createError) {
        console.error('Error creating table:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create application_votes table', details: createError }),
          { headers, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Application votes table created successfully' }),
        { headers, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Application votes table already exists' }),
      { headers, status: 200 }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: err.message }),
      { headers, status: 500 }
    )
  }
})
