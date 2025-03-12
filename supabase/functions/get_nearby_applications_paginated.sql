
CREATE OR REPLACE FUNCTION get_nearby_applications_paginated(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10,
  page_number INTEGER DEFAULT 0,
  page_size INTEGER DEFAULT 50
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  offset_val INTEGER;
BEGIN
  -- Calculate offset based on page number
  offset_val := page_number * page_size;
  
  -- Use bounding box for initial filtering (faster)
  RETURN QUERY
  WITH bounded_results AS (
    SELECT cr.*,
           2 * 6371 * ASIN(SQRT(
             POWER(SIN((RADIANS(cr.latitude) - RADIANS(center_lat))/2), 2) + 
             COS(RADIANS(center_lat)) * COS(RADIANS(cr.latitude)) * 
             POWER(SIN((RADIANS(cr.longitude) - RADIANS(center_lng))/2), 2)
           )) as distance
    FROM crystal_roof cr
    WHERE 
      cr.latitude IS NOT NULL AND
      cr.longitude IS NOT NULL AND
      cr.latitude BETWEEN (center_lat - radius_km/111.0) AND (center_lat + radius_km/111.0) AND
      cr.longitude BETWEEN (center_lng - radius_km/(111.0 * COS(RADIANS(center_lat)))) 
                      AND (center_lng + radius_km/(111.0 * COS(RADIANS(center_lat))))
  )
  SELECT *
  FROM bounded_results
  WHERE distance <= radius_km
  ORDER BY distance ASC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;

-- Add index for improved query performance
CREATE INDEX IF NOT EXISTS idx_crystal_roof_coords 
ON crystal_roof (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Set reasonable timeout
ALTER FUNCTION get_nearby_applications_paginated SET statement_timeout = '5s';

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_nearby_applications_paginated TO anon, authenticated;
