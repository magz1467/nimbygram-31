
-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'crystal_roof' 
    AND column_name = 'geom'
  ) THEN
    -- Add a geometry column
    ALTER TABLE crystal_roof ADD COLUMN geom geometry(Point, 4326);
    -- Update existing rows to populate the geometry column
    UPDATE crystal_roof 
    SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
    -- Create a spatial index
    CREATE INDEX idx_crystal_roof_geom ON crystal_roof USING GIST (geom);
  END IF;
END $$;

-- Create or replace the spatial search function
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
  search_point geometry;
BEGIN
  -- Create search point
  search_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326);
  
  RETURN QUERY
  SELECT cr.*
  FROM crystal_roof cr
  WHERE ST_DWithin(
    cr.geom,
    search_point,
    radius_km * 1000, -- Convert km to meters
    true  -- Use spheroid for more accurate distances
  )
  ORDER BY ST_Distance(cr.geom, search_point)
  LIMIT result_limit;
END;
$$;

-- Add permissions
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

