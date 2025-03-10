
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

    const { center_lat, center_lng, radius_meters = 200000, page_size = 10000, page_number = 0 } = await req.json()

    console.log('Received request with params:', { center_lat, center_lng, radius_meters, page_size, page_number })

    if (!center_lat || !center_lng || !radius_meters) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const startTime = Date.now()

    // First check if we can get a count quickly
    let totalCount = 0;
    let countError = null;
    try {
      // Get total count with timeout handling
      const countResult = await Promise.race([
        supabaseClient.rpc(
          'get_applications_count_within_radius',
          {
            center_lat,
            center_lng,
            radius_meters
          }
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Count query timeout")), 10000)
        )
      ]);
      
      if (countResult.error) {
        throw countResult.error;
      }
      
      totalCount = countResult.data || 0;
      console.log(`Total count: ${totalCount}`);
      
    } catch (error) {
      console.error('Error getting count:', error);
      countError = error;
      // Continue anyway - we can still try to get the applications
    }

    // Get ALL applications without filtering, then sort by distance later in the client
    let applications = [];
    let applicationsError = null;
    
    try {
      // First try using the optimized RPC function with radius
      const applicationsResult = await Promise.race([
        supabaseClient.rpc(
          'get_applications_within_radius',
          {
            center_lat,
            center_lng,
            radius_meters,
            page_size,
            page_number
          }
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Applications query timeout")), 60000) // Increased timeout
        )
      ]);
      
      if (applicationsResult.error) {
        throw applicationsResult.error;
      }
      
      applications = applicationsResult.data || [];
      
    } catch (error) {
      console.error('Error fetching applications:', error);
      applicationsError = error;
      
      // If we failed to get applications, try a direct table query as fallback with no filtering
      if (applications.length === 0) {
        try {
          console.log('Attempting fallback direct query with no filtering');
          
          // Execute a direct table query without filtering to get ALL records
          const fallbackResult = await supabaseClient
            .from('crystal_roof')
            .select('*')
            .limit(page_size);
          
          if (fallbackResult.error) {
            throw fallbackResult.error;
          }
          
          applications = fallbackResult.data || [];
          console.log(`Fallback query returned ${applications.length} results`);
        } catch (fallbackError) {
          console.error('Fallback query failed:', fallbackError);
          // If we still failed, return the original error
          return new Response(
            JSON.stringify({ 
              error: error.message || 'Failed to fetch applications',
              details: 'Error fetching applications',
              timestamp: new Date().toISOString()
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          )
        }
      }
    }

    const endTime = Date.now()
    console.log(`Query execution time: ${endTime - startTime}ms`)
    console.log(`Found ${applications.length} applications${totalCount ? ` out of ${totalCount} total` : ''}`);

    // If we have applications but had a count error, estimate the total
    if (countError && applications.length > 0) {
      totalCount = applications.length * 10; // Rough estimate
    }
    
    // If we have no count but have applications, use the applications length
    if (totalCount === 0 && applications.length > 0) {
      totalCount = applications.length;
    }

    return new Response(
      JSON.stringify({
        applications: applications,
        total: totalCount,
        page: page_number,
        pageSize: page_size,
        hasMore: (page_number + 1) * page_size < totalCount,
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
