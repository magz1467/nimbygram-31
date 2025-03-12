
-- This direct implementation should help resolve any RPC function issues
CREATE OR REPLACE FUNCTION get_nearby_applications(
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10,
  result_limit INTEGER DEFAULT 500
)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  address TEXT,
  status TEXT,
  description TEXT,
  type TEXT,
  reference TEXT,
  submittedDate TEXT,
  decisionDue TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance DOUBLE PRECISION
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  -- Simple implementation with standard SQL for maximum compatibility
  SELECT 
    cr.id,
    cr.title,
    cr.address,
    cr.status,
    cr.description,
    cr.type,
    cr.reference,
    cr.submittedDate,
    cr.decisionDue,
    cr.latitude,
    cr.longitude,
    -- Calculate distance using the Haversine formula
    (6371 * acos(cos(radians(latitude)) * 
                 cos(radians(cr.latitude)) * 
                 cos(radians(cr.longitude) - radians(longitude)) + 
                 sin(radians(latitude)) * 
                 sin(radians(cr.latitude)))) AS distance
  FROM crystal_roof cr
  WHERE 
    cr.latitude IS NOT NULL 
    AND cr.longitude IS NOT NULL
    -- Use a simple bounding box for initial filtering (much faster)
    AND cr.latitude BETWEEN (latitude - radius_km/111.0) AND (latitude + radius_km/111.0)
    AND cr.longitude BETWEEN (longitude - radius_km/(111.0 * COS(RADIANS(latitude)))) 
                       AND (longitude + radius_km/(111.0 * COS(RADIANS(latitude))))
  ORDER BY distance ASC
  LIMIT result_limit;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- Create index on latitude and longitude for faster searches
CREATE INDEX IF NOT EXISTS idx_crystal_roof_lat_lng 
ON crystal_roof (latitude, longitude);

