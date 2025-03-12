
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
  -- Input validation
  IF center_lat IS NULL OR center_lng IS NULL THEN
    RAISE EXCEPTION 'Invalid coordinates: latitude and longitude must be provided';
  END IF;
  
  IF radius_km <= 0 OR radius_km > 50 THEN
    -- Enforce reasonable radius limits
    radius_km := GREATEST(LEAST(radius_km, 50), 0.5);
    RAISE NOTICE 'Adjusted radius to within valid range: %km', radius_km;
  END IF;
  
  -- Validate and limit pagination parameters
  page_size := LEAST(page_size, 100); -- Cap page size at 100
  page_number := GREATEST(page_number, 0); -- Ensure non-negative page number
  
  -- Calculate offset based on page number
  offset_val := page_number * page_size;
  
  -- Log query parameters
  RAISE NOTICE 'Executing paginated search with lat: %, lng: %, radius: %km, page: %, page_size: %', 
               center_lat, center_lng, radius_km, page_number, page_size;
  
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
  
  -- Log completion
  RAISE NOTICE 'Paginated search completed with page % of size %', page_number, page_size;
END;
$$;

-- Add index for improved query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_crystal_roof_coords 
ON crystal_roof (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Set reasonable timeout (increased to 15 seconds to match other function)
ALTER FUNCTION get_nearby_applications_paginated SET statement_timeout = '15s';

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_nearby_applications_paginated TO anon, authenticated;
