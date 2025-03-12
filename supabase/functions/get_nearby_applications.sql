
-- Simple and reliable function to get nearby applications with increased radius
CREATE OR REPLACE FUNCTION get_nearby_applications(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMPTZ := clock_timestamp();
  result_count INTEGER;
BEGIN
  -- Log the incoming request parameters
  RAISE NOTICE 'Spatial search started with lat: %, lng: %, radius: %km', center_lat, center_lng, radius_km;
  
  -- Simple bounding box calculation for better performance
  -- Increased bounding box by using radius_km directly
  RETURN QUERY
  SELECT cr.*
  FROM crystal_roof cr
  WHERE 
    cr.latitude IS NOT NULL 
    AND cr.longitude IS NOT NULL
    AND cr.latitude BETWEEN (center_lat - radius_km/111.0) AND (center_lat + radius_km/111.0)
    AND cr.longitude BETWEEN (center_lng - radius_km/(111.0 * COS(RADIANS(center_lat)))) 
                        AND (center_lng + radius_km/(111.0 * COS(RADIANS(center_lat))))
  ORDER BY
    SQRT(POW(111.0 * (cr.latitude - center_lat), 2) + 
         POW(111.0 * COS(RADIANS(center_lat)) * (cr.longitude - center_lng), 2)) ASC
  LIMIT 500;
  
  -- Get the result count for logging
  GET DIAGNOSTICS result_count = ROW_COUNT;
  
  -- Log the completion of the search
  RAISE NOTICE 'Spatial search completed in % ms with % results', 
    EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time),
    result_count;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- Create an index to speed up queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_crystal_roof_coordinates 
ON crystal_roof(latitude, longitude);
