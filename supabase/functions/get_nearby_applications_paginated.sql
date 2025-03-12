
-- Rename function to match what's expected in Supabase
CREATE OR REPLACE FUNCTION get_applications_in_bounds_paginated(
  ne_lat DOUBLE PRECISION,
  ne_lng DOUBLE PRECISION,
  page_number INTEGER DEFAULT 0,
  page_size INTEGER DEFAULT 50,
  sw_lat DOUBLE PRECISION,
  sw_lng DOUBLE PRECISION
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  offset_val INTEGER;
  center_lat DOUBLE PRECISION;
  center_lng DOUBLE PRECISION;
  radius_km DOUBLE PRECISION DEFAULT 5; -- Always use 5km
BEGIN
  -- Input validation
  IF ne_lat IS NULL OR ne_lng IS NULL OR sw_lat IS NULL OR sw_lng IS NULL THEN
    RAISE EXCEPTION 'Invalid coordinates: all boundary coordinates must be provided';
  END IF;
  
  -- Calculate center point from the bounding box
  center_lat := (ne_lat + sw_lat) / 2;
  center_lng := (ne_lng + sw_lng) / 2;
  
  -- Validate and limit pagination parameters
  page_size := LEAST(page_size, 100); -- Cap page size at 100
  page_number := GREATEST(page_number, 0); -- Ensure non-negative page number
  
  -- Calculate offset based on page number
  offset_val := page_number * page_size;
  
  -- Log query parameters
  RAISE NOTICE 'Executing paginated search with bounds NE: (%, %), SW: (%, %), center: (%, %), page: %, page_size: %',
               ne_lat, ne_lng, sw_lat, sw_lng, center_lat, center_lng, page_number, page_size;
  
  -- Use bounding box for initial filtering (faster)
  RETURN QUERY
  WITH bounded_results AS (
    SELECT cr.*,
           2 * 6371 * ASIN(SQRT(
             POWER(SIN((RADIANS(cr.latitude) - RADIANS(center_lat))/2), 2) + 
             COS(RADIANS(center_lat)) * COS(RADIANS(cr.latitude)) * 
             POWER(SIN((RADIANS(cr.longitude) - RADIANS(center_lng))/2), 2)
           )) as distance_km
    FROM crystal_roof cr
    WHERE 
      cr.latitude IS NOT NULL AND
      cr.longitude IS NOT NULL AND
      cr.latitude BETWEEN sw_lat AND ne_lat AND
      cr.longitude BETWEEN sw_lng AND ne_lng
  )
  SELECT *
  FROM bounded_results
  WHERE distance_km <= radius_km
  ORDER BY distance_km ASC
  LIMIT page_size
  OFFSET offset_val;
  
  -- Log completion
  RAISE NOTICE 'Paginated search completed with page % of size %', page_number, page_size;
END;
$$;

-- Set timeout to 30 seconds
ALTER FUNCTION get_applications_in_bounds_paginated SET statement_timeout = '30s';

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_applications_in_bounds_paginated TO anon, authenticated;
