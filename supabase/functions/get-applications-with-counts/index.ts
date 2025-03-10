
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

    const { center_lat, center_lng, radius_meters = 1000000, page_size = 1000, page_number = 0 } = await req.json()

    console.log('Received request with params:', { center_lat, center_lng, radius_meters, page_size, page_number });

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
    
    // Fetch applications in smaller batches to avoid timeouts
    const pageSize = Math.min(page_size, 1000); // Cap the page size
    let applications = [];
    let totalCount = 0;
    let hasMore = true;
    let partialResults = false;
    
    try {
      // First, get a count of all records (with a short timeout)
      const countResult = await supabaseClient
        .from('crystal_roof')
        .select('id', { count: 'exact', head: true })
        .timeout(5); // 5 second timeout
        
      if (countResult.count !== null) {
        totalCount = countResult.count;
        console.log(`Total record count: ${totalCount}`);
      }
    } catch (countError) {
      console.error('Error getting count:', countError);
      // Continue without count
    }
    
    try {
      // Fetch the actual records with pagination
      const offset = page_number * pageSize;
      console.log(`Fetching records with offset ${offset} and limit ${pageSize}`);
      
      const result = await supabaseClient
        .from('crystal_roof')
        .select('*')
        .range(offset, offset + pageSize - 1)
        .timeout(30); // 30 second timeout
      
      if (result.error) {
        throw result.error;
      }
      
      applications = result.data || [];
      console.log(`Retrieved ${applications.length} applications from database`);
    } catch (error) {
      console.error('Error fetching applications:', error);
      partialResults = true;
      
      // Try to get at least some results with a smaller query
      try {
        console.log('Attempting to fetch a smaller batch of results');
        const fallbackResult = await supabaseClient
          .from('crystal_roof')
          .select('*')
          .limit(100)
          .timeout(10);
          
        if (fallbackResult.data && fallbackResult.data.length > 0) {
          applications = fallbackResult.data;
          console.log(`Retrieved ${applications.length} applications in fallback query`);
        }
      } catch (fallbackError) {
        console.error('Even fallback query failed:', fallbackError);
      }
    }

    const endTime = Date.now();
    console.log(`Query execution time: ${endTime - startTime}ms`);
    console.log(`Returning ${applications.length} applications`);

    return new Response(
      JSON.stringify({
        applications: applications,
        total: totalCount,
        page: page_number,
        pageSize: pageSize,
        hasMore: applications.length >= pageSize,
        executionTime: endTime - startTime,
        partialResults: partialResults
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
