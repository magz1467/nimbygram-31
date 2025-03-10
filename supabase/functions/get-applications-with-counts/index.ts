
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

    const { center_lat, center_lng, page_size = 25, page_number = 0 } = await req.json()

    console.log('Received request with params:', { center_lat, center_lng, page_size, page_number });

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
    
    // Ensure page size is reasonable
    const pageSize = Math.min(page_size, 100); // Cap at 100 max
    const offset = page_number * pageSize;
    
    let totalCount = 0;
    let applications = [];
    
    try {
      // First, get a count of all records (fast query)
      const countResult = await supabaseClient
        .from('crystal_roof')
        .select('id', { count: 'exact', head: true });
        
      if (countResult.count !== null) {
        totalCount = countResult.count;
        console.log(`Total record count: ${totalCount}`);
      }
      
      // Fetch the requested page
      console.log(`Fetching records with offset ${offset} and limit ${pageSize}`);
      const result = await supabaseClient
        .from('crystal_roof')
        .select('*')
        .range(offset, offset + pageSize - 1);
      
      if (result.error) {
        throw result.error;
      }
      
      applications = result.data || [];
      console.log(`Retrieved ${applications.length} applications from database`);
    } catch (error) {
      console.error('Error fetching data:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Database query failed',
          details: error.message || 'Unknown database error',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const endTime = Date.now();
    console.log(`Query execution time: ${endTime - startTime}ms`);
    
    // Calculate if there are more pages
    const hasMore = offset + applications.length < totalCount;

    return new Response(
      JSON.stringify({
        applications,
        total: totalCount,
        page: page_number,
        pageSize,
        hasMore,
        executionTime: endTime - startTime
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
