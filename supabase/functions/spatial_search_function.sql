
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Optimize the spatial search function for better performance
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
    
    -- Add a spatial index on the geometry column for faster spatial queries
    CREATE INDEX idx_crystal_roof_geom ON crystal_roof USING GIST (geom);
  END IF;
END $$;

-- Create regular indexes on lat/lng columns for non-spatial queries
CREATE INDEX IF NOT EXISTS idx_crystal_roof_lat ON crystal_roof (latitude);
CREATE INDEX IF NOT EXISTS idx_crystal_roof_lng ON crystal_roof (longitude);
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
  bbox geometry;
  start_time timestamptz;
  query_time interval;
  lat_min DOUBLE PRECISION;
  lat_max DOUBLE PRECISION;
  lng_min DOUBLE PRECISION;
  lng_max DOUBLE PRECISION;
BEGIN
  -- Start performance timing
  start_time := clock_timestamp();
  
  -- Convert parameters to appropriate types
  search_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326);
  search_radius_meters := radius_km * 1000;
  
  -- Set a more generous statement timeout to prevent long-running queries from failing
  -- but not so long that users are waiting forever
  SET LOCAL statement_timeout = '30s';
  
  -- Pre-calculate bounding box coordinates for more efficient filtering
  -- 1 degree latitude is approximately 111.32 km
  lat_min := center_lat - (radius_km / 111.32);
  lat_max := center_lat + (radius_km / 111.32);
  
  -- Longitude degrees per km varies with latitude
  lng_min := center_lng - (radius_km / (111.32 * COS(RADIANS(center_lat))));
  lng_max := center_lng + (radius_km / (111.32 * COS(RADIANS(center_lat))));
  
  -- Create a spatial bounding box
  bbox := ST_MakeEnvelope(lng_min, lat_min, lng_max, lat_max, 4326);
  
  -- Log query parameters for debugging
  RAISE NOTICE 'Searching near (%, %) with radius % km', center_lat, center_lng, radius_km;
  
  -- Use a multi-stage query approach for better performance:
  -- 1. First filter by bounding box (uses spatial index, very fast)
  -- 2. Then filter by actual distance (more precise but can use PostGIS optimization)
  -- 3. Apply limit for pagination
  
  RETURN QUERY
  WITH bbox_filtered AS (
    SELECT *
    FROM crystal_roof
    WHERE 
      latitude IS NOT NULL AND
      longitude IS NOT NULL AND
      -- Use either geometry column with GIST index or lat/lng columns with btree index
      -- The query planner will choose the most efficient approach
      (
        (geom IS NOT NULL AND ST_Within(geom, bbox))
        OR 
        (
          latitude BETWEEN lat_min AND lat_max AND
          longitude BETWEEN lng_min AND lng_max
        )
      )
    LIMIT result_limit * 2  -- Get more than needed for the final distance filter
  ),
  distance_calculated AS (
    SELECT 
      app.*,
      CASE
        -- Use PostGIS distance calculation if geometry column is available
        WHEN app.geom IS NOT NULL THEN 
          ST_Distance(app.geom::geography, search_point::geography)
        -- Fall back to Haversine formula if geometry is not available
        ELSE
          (2 * 6371000 * asin(sqrt(
            power(sin((radians(app.latitude) - radians(center_lat))/2), 2) +
            cos(radians(center_lat)) * cos(radians(app.latitude)) *
            power(sin((radians(app.longitude) - radians(center_lng))/2), 2)
          )))
      END AS distance_meters
    FROM bbox_filtered app
  )
  SELECT * FROM distance_calculated
  WHERE distance_meters <= search_radius_meters
  ORDER BY distance_meters ASC
  LIMIT result_limit;
  
  -- Log execution time for performance monitoring
  query_time := clock_timestamp() - start_time;
  RAISE NOTICE 'Spatial query executed in % ms', EXTRACT(MILLISECOND FROM query_time);
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
