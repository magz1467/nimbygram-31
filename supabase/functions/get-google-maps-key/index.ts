
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Hardcoded API key for faster response
    let apiKey = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';
    
    // As a fallback, try to get it from environment variables
    if (!apiKey) {
      apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY') || Deno.env.get('GOOGLE_MAPS_API-KEY');
      
      if (!apiKey) {
        console.error('Google Maps API key not found in environment variables');
        return new Response(
          JSON.stringify({ 
            error: 'API key not configured',
            message: 'Please configure the Google Maps API key in Supabase secrets with the name GOOGLE_MAPS_API_KEY'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        )
      }
    }

    console.log('API Key validation:')
    console.log('- Key length:', apiKey.length)
    console.log('- First 4 chars:', apiKey.substring(0, 4))
    console.log('- Last 4 chars:', apiKey.substring(apiKey.length - 4))

    return new Response(
      JSON.stringify({ 
        apiKey,
        status: 'success',
        message: 'API key retrieved successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in get-google-maps-key:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to retrieve Google Maps API key',
        details: error.message,
        status: 'error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
