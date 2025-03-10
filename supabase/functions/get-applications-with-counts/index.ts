
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { center_lat, center_lng, radius_meters = 1000000, page_size = 100000, page_number = 0, no_filtering = true } = await req.json()

    console.log('Received request with params:', { center_lat, center_lng, radius_meters, page_size, page_number, no_filtering });

    if (!center_lat || !center_lng) {
      return new Response(
        JSON.stringify({ error: 'Missing required coordinates parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const startTime = Date.now();
    
    // Skip count query if we're fetching all records
    let totalCount = 0;
    let countError = null;
    
    // Get ALL applications without any geographic filtering
    let applications = [];
    let applicationsError = null;
    
    try {
      console.log('Fetching ALL applications without geographic filtering');
      
      // Execute a direct table query without filtering to get ALL records
      const allRecordsResult = await supabaseClient
        .from('crystal_roof')
        .select('*');
      
      if (allRecordsResult.error) {
        throw allRecordsResult.error;
      }
      
      applications = allRecordsResult.data || [];
      totalCount = applications.length;
      console.log(`Retrieved ALL ${applications.length} records from database`);
      
    } catch (error) {
      console.error('Error fetching all applications:', error);
      applicationsError = error;
    }

    const endTime = Date.now();
    console.log(`Query execution time: ${endTime - startTime}ms`);
    console.log(`Found ${applications.length} total applications`);

    return new Response(
      JSON.stringify({
        applications: applications,
        total: totalCount,
        page: page_number,
        pageSize: page_size,
        hasMore: false, // No more pages when we get all records
        executionTime: endTime - startTime,
        countError: countError ? countError.message : null,
        applicationsError: applicationsError ? applicationsError.message : null,
        partialResults: applicationsError !== null
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: 'An error occurred while processing your request',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500,
      },
    )
  }
})
