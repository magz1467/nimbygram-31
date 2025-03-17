
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // IMPORTANT: Always use the centralized API key value
    // This matches the key in src/utils/api-keys.ts
    const apiKey = 'AIzaSyCuw9EAyPuxA7XssqBSd996Mu8deQmgZYY';
    
    // Log the request origin to help debug domain restriction issues
    const origin = req.headers.get('origin') || 'unknown';
    
    console.log('API Key request:')
    console.log('- Origin:', origin)
    console.log('- Key length:', apiKey.length)
    console.log('- First 4 chars:', apiKey.substring(0, 4))
    console.log('- Last 4 chars:', apiKey.substring(apiKey.length - 4))

    return new Response(
      JSON.stringify({ 
        apiKey,
        status: 'success',
        message: 'API key retrieved successfully',
        requestOrigin: origin
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
