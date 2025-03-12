
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

    const { center_lat, center_lng, radius_km = 10, page_size = 200, page_number = 0 } = await req.json()

    console.log('Received request with params:', { center_lat, center_lng, radius_km, page_size, page_number });

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
    
    // Calculate bounding box for better performance
    const latDelta = radius_km / 111.32; // 1 degree latitude is approximately 111.32 km
    const lngDelta = radius_km / (111.32 * Math.cos(center_lat * Math.PI / 180));
    
    const minLat = center_lat - latDelta;
    const maxLat = center_lat + latDelta;
    const minLng = center_lng - lngDelta;
    const maxLng = center_lng + lngDelta;
    
    console.log(`Search bounds: lat ${minLat.toFixed(4)} to ${maxLat.toFixed(4)}, lng ${minLng.toFixed(4)} to ${maxLng.toFixed(4)}`);
    
    // Fetch applications in smaller batches to avoid timeouts
    const pageSize = Math.min(page_size, 200); // Cap the page size
    const offset = page_number * pageSize;
    let applications = [];
    let totalCount = 0;
    let partialResults = false;
    
    try {
      // First try to get a count of all records in the bounding box
      const countResult = await supabaseClient
        .from('crystal_roof')
        .select('id', { count: 'exact', head: true })
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLng)
        .lte('longitude', maxLng);
        
      if (countResult.count !== null) {
        totalCount = countResult.count;
        console.log(`Total record count in bounding box: ${totalCount}`);
      }
    } catch (countError) {
      console.error('Error getting count:', countError);
      // Continue without count
    }
    
    try {
      // Fetch the actual records with pagination
      console.log(`Fetching records with offset ${offset} and limit ${pageSize}`);
      
      const result = await supabaseClient
        .from('crystal_roof')
        .select('*')
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLng)
        .lte('longitude', maxLng)
        .range(offset, offset + pageSize - 1);
      
      if (result.error) {
        throw result.error;
      }
      
      applications = result.data || [];
      console.log(`Retrieved ${applications.length} applications from database`);
      
      // Calculate distance and add it to each application
      applications = applications.map((app) => {
        if (app.latitude && app.longitude) {
          // Haversine formula for distance in km
          const R = 6371; // km
          const dLat = (app.latitude - center_lat) * Math.PI / 180;
          const dLon = (app.longitude - center_lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(center_lat * Math.PI / 180) * Math.cos(app.latitude * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          return {
            ...app,
            distance_km: distance,
            distance: `${(distance * 0.621371).toFixed(1)} mi`
          };
        }
        return app;
      });
      
      // Sort by distance
      applications.sort((a, b) => (a.distance_km || Infinity) - (b.distance_km || Infinity));
      
    } catch (error) {
      console.error('Error fetching applications:', error);
      partialResults = true;
      
      // Try to get at least some results with a smaller query
      try {
        console.log('Attempting to fetch a smaller batch of results');
        const fallbackResult = await supabaseClient
          .from('crystal_roof')
          .select('*')
          .gte('latitude', center_lat - (radius_km * 0.5)/111.32)
          .lte('latitude', center_lat + (radius_km * 0.5)/111.32)
          .gte('longitude', center_lng - (radius_km * 0.5)/(111.32 * Math.cos(center_lat * Math.PI / 180)))
          .lte('longitude', center_lng + (radius_km * 0.5)/(111.32 * Math.cos(center_lat * Math.PI / 180)))
          .limit(50);
          
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
