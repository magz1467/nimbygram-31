
-- Function to get nearby applications within a radius using PostGIS
CREATE OR REPLACE FUNCTION get_nearby_applications(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10,
  result_limit INTEGER DEFAULT 500
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_point GEOGRAPHY;
BEGIN
  -- Create a geography point from the input coordinates
  search_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::GEOGRAPHY;
  
  RETURN QUERY
  SELECT cr.*
  FROM crystal_roof cr
  WHERE 
    -- Only include points that have both latitude and longitude
    cr.latitude IS NOT NULL AND
    cr.longitude IS NOT NULL AND
    -- Calculate distance using ST_DWithin for better performance
    ST_DWithin(
      search_point,
      ST_SetSRID(ST_MakePoint(cr.longitude, cr.latitude), 4326)::GEOGRAPHY,
      radius_km * 1000  -- Convert km to meters
    )
  ORDER BY
    -- Order by distance from search point
    ST_Distance(
      search_point,
      ST_SetSRID(ST_MakePoint(cr.longitude, cr.latitude), 4326)::GEOGRAPHY
    ) ASC
  LIMIT result_limit;
END;
$$;

-- Create spatial index if it doesn't exist already
DO $$
BEGIN
  -- Check if PostGIS extension is available
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) THEN
    -- Try to create spatial index on geometry points
    BEGIN
      CREATE INDEX IF NOT EXISTS idx_crystal_roof_geom 
      ON crystal_roof USING GIST (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::GEOGRAPHY
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create spatial index: %', SQLERRM;
    END;
  END IF;
END;
$$;

-- Add permissions for anonymous and authenticated users to use the function
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;
