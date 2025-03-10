
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

    const { center_lat, center_lng, radius_meters, search_term, page_size = 100, page_number = 0 } = await req.json()

    console.log('Received request with params:', { center_lat, center_lng, radius_meters, search_term, page_size, page_number })

    if ((!center_lat || !center_lng || !radius_meters) && !search_term) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const startTime = Date.now()
    
    let query = null
    
    if (center_lat && center_lng && radius_meters) {
      // Get applications within radius with timeout handling
      query = supabaseClient.rpc(
        'get_applications_within_radius',
        {
          center_lat,
          center_lng,
          radius_meters,
          page_size,
          page_number
        }
      )
      
      // Add text search if provided
      if (search_term) {
        query = query.or(`address.ilike.%${search_term}%,description.ilike.%${search_term}%,ward_name.ilike.%${search_term}%,local_authority_district_name.ilike.%${search_term}%`)
      }
    } else if (search_term) {
      // Text-only search
      query = supabaseClient
        .from('crystal_roof')
        .select('*')
        .or(`address.ilike.%${search_term}%,description.ilike.%${search_term}%,ward_name.ilike.%${search_term}%,local_authority_district_name.ilike.%${search_term}%`)
        .limit(page_size)
        .range(page_number * page_size, (page_number + 1) * page_size - 1)
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid search parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    const { data: applications, error: applicationsError } = await query.timeout(30000) // 30 second timeout

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError)
      return new Response(
        JSON.stringify({ 
          error: applicationsError.message,
          details: 'Error fetching applications'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Get total count with timeout handling
    let totalCount = 0
    let countError = null
    
    if (center_lat && center_lng && radius_meters) {
      const countResult = await supabaseClient.rpc(
        'get_applications_count_within_radius',
        {
          center_lat,
          center_lng,
          radius_meters
        }
      ).timeout(15000) // 15 second timeout
      
      totalCount = countResult.data || 0
      countError = countResult.error
    } else if (search_term) {
      const countResult = await supabaseClient
        .from('crystal_roof')
        .select('id', { count: 'exact', head: true })
        .or(`address.ilike.%${search_term}%,description.ilike.%${search_term}%,ward_name.ilike.%${search_term}%,local_authority_district_name.ilike.%${search_term}%`)
        .timeout(15000)
        
      totalCount = countResult.count || 0
      countError = countResult.error
    }

    if (countError) {
      console.error('Error getting count:', countError)
      // Continue with applications but log the count error
    }

    const endTime = Date.now()
    console.log(`Query execution time: ${endTime - startTime}ms`)
    console.log(`Found ${applications?.length} applications out of ${totalCount} total`)

    return new Response(
      JSON.stringify({
        applications: applications || [],
        total: totalCount || 0,
        page: page_number,
        pageSize: page_size,
        hasMore: (page_number + 1) * page_size < (totalCount || 0),
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
