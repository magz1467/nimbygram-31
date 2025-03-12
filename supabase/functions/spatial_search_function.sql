
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- First, check if we need to add a geometry column to crystal_roof table
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
    
    -- Add a spatial index on the geometry column
    CREATE INDEX idx_crystal_roof_geom ON crystal_roof USING GIST (geom);
  END IF;
END $$;

-- Create a separate regular index on lat/lng for non-spatial queries
CREATE INDEX IF NOT EXISTS idx_crystal_roof_lat_lng ON crystal_roof (latitude, longitude);

-- Create or replace the optimized spatial search function
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
  search_radius_meters DOUBLE PRECISION;
BEGIN
  -- Convert parameters to appropriate types
  search_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326);
  search_radius_meters := radius_km * 1000;
  
  -- Set a statement timeout to 30 seconds (to prevent long-running queries)
  SET LOCAL statement_timeout = '30s';
  
  -- Use a two-step query for better performance:
  -- 1. First use fast bounding box operation
  -- 2. Then refine with more expensive exact distance calculation
  
  RETURN QUERY
  WITH bbox_candidates AS (
    SELECT * 
    FROM crystal_roof
    WHERE 
      latitude IS NOT NULL AND 
      longitude IS NOT NULL AND
      -- Fast bounding box filter using index
      latitude BETWEEN (center_lat - radius_km/111.0) AND (center_lat + radius_km/111.0) AND
      longitude BETWEEN 
        (center_lng - radius_km/(111.0*COS(RADIANS(center_lat)))) AND 
        (center_lng + radius_km/(111.0*COS(RADIANS(center_lat))))
    LIMIT result_limit * 2  -- Get more than needed for the next filtering step
  )
  SELECT *
  FROM bbox_candidates
  WHERE 
    -- If geom column is populated, use it for precise distance check
    (geom IS NOT NULL AND 
     ST_DWithin(geom::geography, search_point::geography, search_radius_meters))
    OR
    -- Fallback to haversine calculation if geom is not available
    (geom IS NULL AND 
     (2 * 6371 * ASIN(SQRT(
        POWER(SIN((RADIANS(latitude) - RADIANS(center_lat))/2), 2) + 
        COS(RADIANS(center_lat)) * COS(RADIANS(latitude)) * 
        POWER(SIN((RADIANS(longitude) - RADIANS(center_lng))/2), 2)
      )) <= radius_km))
  ORDER BY
    -- Order by distance
    ST_Distance(
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
      search_point::geography
    )
  LIMIT result_limit;
END;
$$;

-- Add a trigger to automatically update the geometry column when lat/lng changes
CREATE OR REPLACE FUNCTION update_geom_from_lat_lng()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trig_update_geom ON crystal_roof;

-- Create the trigger
CREATE TRIGGER trig_update_geom
BEFORE INSERT OR UPDATE ON crystal_roof
FOR EACH ROW
EXECUTE FUNCTION update_geom_from_lat_lng();

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;
