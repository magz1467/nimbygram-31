
-- Create a standardized optimized function for getting nearby applications

-- First enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Check and create geometry column if it doesn't exist
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

-- Create or replace the spatial search function with optimized performance
CREATE OR REPLACE FUNCTION get_nearby_applications(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5,
  result_limit INTEGER DEFAULT 100
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_point geometry;
  bbox geometry;
BEGIN
  -- Set a reasonable statement timeout
  SET LOCAL statement_timeout = '20s';
  
  -- Convert inputs to geometry
  search_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326);
  
  -- Create a bounding box for efficient initial filtering
  bbox := ST_Expand(search_point, radius_km/111.0);
  
  -- Use efficient two-step filtering:
  -- 1. First filter by bounding box (fast)
  -- 2. Then filter by actual distance (more precise but slower)
  RETURN QUERY
  WITH bbox_filtered AS (
    SELECT *
    FROM crystal_roof
    WHERE 
      latitude IS NOT NULL AND
      longitude IS NOT NULL AND
      -- Use standard index on lat/lng for initial filtering
      latitude BETWEEN (center_lat - radius_km/111.0) AND (center_lat + radius_km/111.0) AND
      longitude BETWEEN 
        (center_lng - radius_km/(111.0*COS(RADIANS(center_lat)))) AND 
        (center_lng + radius_km/(111.0*COS(RADIANS(center_lat))))
    LIMIT result_limit * 2  -- Get more than needed for next filtering step
  )
  SELECT *
  FROM bbox_filtered
  WHERE
    -- Calculate actual distance using geographic coordinates
    ST_Distance(
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, 
      search_point::geography
    ) <= radius_km * 1000  -- Convert km to meters
  ORDER BY
    -- Order by actual distance
    ST_Distance(
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, 
      search_point::geography
    )
  LIMIT result_limit;
  
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- Add a trigger to update geometry when lat/lng change
CREATE OR REPLACE FUNCTION update_crystal_roof_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_crystal_roof_geom_trigger'
  ) THEN
    CREATE TRIGGER update_crystal_roof_geom_trigger
    BEFORE INSERT OR UPDATE ON crystal_roof
    FOR EACH ROW
    EXECUTE FUNCTION update_crystal_roof_geom();
  END IF;
END $$;
