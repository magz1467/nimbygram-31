
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
  result_limit INTEGER DEFAULT 200
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- Variables for improved performance
  search_point GEOGRAPHY;
  lat_min DOUBLE PRECISION;
  lat_max DOUBLE PRECISION;
  lng_min DOUBLE PRECISION;
  lng_max DOUBLE PRECISION;
BEGIN
  -- Calculate bounding box for pre-filtering (faster than full spatial calculations)
  lat_min := center_lat - (radius_km/111.0);
  lat_max := center_lat + (radius_km/111.0);
  
  -- Longitude degrees per km varies with latitude
  lng_min := center_lng - (radius_km/(111.0 * COS(RADIANS(center_lat))));
  lng_max := center_lng + (radius_km/(111.0 * COS(RADIANS(center_lat))));
  
  -- Create a geography point from the input coordinates
  search_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::GEOGRAPHY;
  
  -- Use a two-step process for better performance:
  -- 1. First filter by bounding box (fast)
  -- 2. Then filter by actual distance (more accurate but slower)
  
  -- Set a statement timeout for this function to prevent long-running queries
  -- Default PostgreSQL timeout is too long for web requests
  SET LOCAL statement_timeout = '15s';
  
  RETURN QUERY
  WITH bbox_filtered AS (
    -- Fast pre-filtering using bounding box
    SELECT *
    FROM crystal_roof
    WHERE 
      latitude IS NOT NULL AND
      longitude IS NOT NULL AND
      latitude BETWEEN lat_min AND lat_max AND
      longitude BETWEEN lng_min AND lng_max
    LIMIT result_limit * 2  -- Get more than needed for the next filtering step
  )
  SELECT * 
  FROM bbox_filtered
  WHERE 
    -- Only include points within the actual radius (more precise)
    ST_DWithin(
      search_point,
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::GEOGRAPHY,
      radius_km * 1000  -- Convert km to meters
    )
  ORDER BY
    -- Order by actual distance for better results
    ST_Distance(
      search_point,
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::GEOGRAPHY
    ) ASC
  LIMIT result_limit;
  
END;
$$;

-- Add permissions for anonymous and authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- To avoid conflicts, delete the other function if it exists
DROP FUNCTION IF EXISTS get_nearby_applications(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION);
