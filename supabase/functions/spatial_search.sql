
-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create the spatial search function
CREATE OR REPLACE FUNCTION get_nearby_applications(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_point GEOMETRY;
BEGIN
  -- Create the search point
  search_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326);
  
  -- Return applications within radius
  RETURN QUERY
  SELECT cr.*
  FROM crystal_roof cr
  WHERE ST_DWithin(
    cr.geom::geography,
    search_point::geography,
    radius_km * 1000  -- Convert km to meters
  )
  ORDER BY ST_Distance(
    cr.geom::geography,
    search_point::geography
  )
  LIMIT 100;
END;
$$;

-- Set timeout
ALTER FUNCTION get_nearby_applications SET statement_timeout = '30s';

-- Add permissions
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- Create spatial index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_crystal_roof_geom ON crystal_roof USING GIST (geom);
