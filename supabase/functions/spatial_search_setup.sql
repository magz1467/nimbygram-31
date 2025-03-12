
-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- First create the function that handles nearby application searches
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
  bbox geometry;
BEGIN
  -- Set a reasonable timeout
  SET LOCAL statement_timeout = '8000';
  
  -- Create a bounding box for initial filtering
  bbox := ST_Expand(
    ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326),
    radius_km / 111.0
  );
  
  -- Return filtered results
  RETURN QUERY
  SELECT *
  FROM crystal_roof
  WHERE 
    latitude IS NOT NULL AND
    longitude IS NOT NULL AND
    -- Fast bounding box filter
    latitude BETWEEN (center_lat - radius_km/111.0) AND (center_lat + radius_km/111.0) AND
    longitude BETWEEN 
      (center_lng - radius_km/(111.0 * COS(RADIANS(center_lat)))) AND 
      (center_lng + radius_km/(111.0 * COS(RADIANS(center_lat))))
  ORDER BY
    -- Calculate actual distance for sorting
    SQRT(
      POW(69.1 * (latitude - center_lat), 2) +
      POW(69.1 * (longitude - center_lng) * COS(center_lat / 57.3), 2)
    ) ASC
  LIMIT result_limit;
END;
$$;

-- Grant execute permissions to all users
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- Create index on lat/lng for faster searches if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_crystal_roof_lat_lng 
ON crystal_roof (latitude, longitude);
