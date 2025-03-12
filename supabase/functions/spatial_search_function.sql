
-- First, make sure PostGIS extension is enabled (if not already)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add a geometry column to crystal_roof if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crystal_roof' AND column_name = 'geom'
  ) THEN
    -- Add geometry column
    PERFORM AddGeometryColumn('public', 'crystal_roof', 'geom', 4326, 'POINT', 2);
    
    -- Populate geometry column from existing lat/long
    UPDATE crystal_roof 
    SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
    
    -- Create spatial index
    CREATE INDEX idx_crystal_roof_geom ON crystal_roof USING GIST (geom);
  END IF;
END
$$;

-- Create or replace the paginated search function using PostGIS
CREATE OR REPLACE FUNCTION get_nearby_applications_paginated(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5, -- Changed default to 5km
  page_number INTEGER DEFAULT 0,
  page_size INTEGER DEFAULT 10  -- Changed default to 10
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_point geometry;
  offset_val INTEGER;
BEGIN
  -- Input validation
  IF center_lat IS NULL OR center_lng IS NULL THEN
    RAISE EXCEPTION 'Invalid coordinates: latitude and longitude must be provided';
  END IF;
  
  -- Enforce reasonable radius limits
  radius_km := GREATEST(LEAST(radius_km, 50), 0.1);
  
  -- Validate pagination
  page_size := LEAST(page_size, 50);  -- Cap at 50 max results per page
  page_number := GREATEST(page_number, 0);
  offset_val := page_number * page_size;
  
  -- Create search point
  search_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326);
  
  -- Log query parameters
  RAISE NOTICE 'Executing spatial search at (%, %) with radius %km, page: %, size: %',
    center_lat, center_lng, radius_km, page_number, page_size;
  
  RETURN QUERY
  SELECT 
    cr.*
  FROM crystal_roof cr
  WHERE 
    cr.geom IS NOT NULL
    -- ST_DWithin with geography type for accurate distance calculation
    AND ST_DWithin(
      cr.geom::geography,
      search_point::geography,
      radius_km * 1000  -- Convert km to meters
    )
  ORDER BY 
    -- Calculate exact distance for sorting
    ST_Distance(
      cr.geom::geography,
      search_point::geography
    )
  LIMIT page_size
  OFFSET offset_val;
  
  RAISE NOTICE 'Spatial search completed for page % with size %', page_number, page_size;
END;
$$;

-- Set reasonable timeout
ALTER FUNCTION get_nearby_applications_paginated SET statement_timeout = '15s';

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_nearby_applications_paginated TO anon, authenticated;
