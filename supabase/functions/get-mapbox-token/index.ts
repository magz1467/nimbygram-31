import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts'

serve(async (req) => {
  try {
    const MAPBOX_PUBLIC_TOKEN = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    
    if (!MAPBOX_PUBLIC_TOKEN) {
      throw new Error('MAPBOX_PUBLIC_TOKEN not found')
    }

    return new Response(
      JSON.stringify({ MAPBOX_PUBLIC_TOKEN }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})