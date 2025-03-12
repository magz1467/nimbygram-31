
-- Create spatial search function for crystal_roof table
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
  lat_min DOUBLE PRECISION;
  lat_max DOUBLE PRECISION;
  lng_min DOUBLE PRECISION;
  lng_max DOUBLE PRECISION;
BEGIN
  -- Calculate bounding box for better performance
  lat_min := center_lat - (radius_km/111.0);
  lat_max := center_lat + (radius_km/111.0);
  
  -- Longitude degrees per km varies with latitude
  lng_min := center_lng - (radius_km/(111.0 * COS(RADIANS(center_lat))));
  lng_max := center_lng + (radius_km/(111.0 * COS(RADIANS(center_lat))));
  
  -- Use bounding box approach with distance calculation
  RETURN QUERY
  SELECT cr.*
  FROM crystal_roof cr
  WHERE 
    -- Only include points that have both latitude and longitude
    cr.latitude IS NOT NULL AND
    cr.longitude IS NOT NULL AND
    -- Fast bounding box filter
    cr.latitude BETWEEN lat_min AND lat_max AND
    cr.longitude BETWEEN lng_min AND lng_max
  ORDER BY
    -- Calculate distance using haversine formula for better accuracy
    2 * 6371 * ASIN(SQRT(
      POWER(SIN((RADIANS(cr.latitude) - RADIANS(center_lat))/2), 2) + 
      COS(RADIANS(center_lat)) * COS(RADIANS(cr.latitude)) * 
      POWER(SIN((RADIANS(cr.longitude) - RADIANS(center_lng))/2), 2)
    )) ASC
  LIMIT result_limit;
END;
$$;

-- Add permissions for anonymous and authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- Create index on latitude and longitude for faster searches
CREATE INDEX IF NOT EXISTS idx_crystal_roof_lat_lng 
ON crystal_roof (latitude, longitude);

-- Set timeout to prevent long-running queries
ALTER FUNCTION get_nearby_applications SET statement_timeout = '15s';
