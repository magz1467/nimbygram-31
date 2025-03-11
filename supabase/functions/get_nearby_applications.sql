
-- Function to get nearby applications within a radius using PostGIS
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
  -- Create a geography point from the input coordinates
  search_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::GEOGRAPHY;
  
  -- Calculate bounding box for pre-filtering (faster than full spatial calculations)
  lat_min := center_lat - (radius_km/111.0);
  lat_max := center_lat + (radius_km/111.0);
  lng_min := center_lng - (radius_km/(111.0 * COS(RADIANS(center_lat))));
  lng_max := center_lng + (radius_km/(111.0 * COS(RADIANS(center_lat))));
  
  -- Use a two-step process: first filter by bounding box (fast), then refine with exact distance (slower)
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
    -- Only include points within the actual radius
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

-- Set a statement timeout to prevent long-running queries
ALTER FUNCTION get_nearby_applications SET statement_timeout = '5s';

-- Add permissions for anonymous and authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- Optimize index for fast bounding box searches
DROP INDEX IF EXISTS idx_crystal_roof_lat_lng;
CREATE INDEX idx_crystal_roof_lat_lng ON crystal_roof (latitude, longitude);
