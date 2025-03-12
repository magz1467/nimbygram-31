
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
  distance DOUBLE PRECISION,
  debug_info JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  execution_time INTERVAL;
  lat_min DOUBLE PRECISION;
  lat_max DOUBLE PRECISION;
  lng_min DOUBLE PRECISION;
  lng_max DOUBLE PRECISION;
  box_size TEXT;
BEGIN
  -- Record start time for performance logging
  start_time := clock_timestamp();
  
  -- Calculate bounding box for pre-filtering
  lat_min := latitude - (radius_km/111.0);
  lat_max := latitude + (radius_km/111.0);
  lng_min := longitude - (radius_km/(111.0 * COS(RADIANS(latitude))));
  lng_max := longitude + (radius_km/(111.0 * COS(RADIANS(latitude))));
  
  -- Format bounding box for debugging
  box_size := format('Bounding box: lat [%s to %s], lng [%s to %s]', 
                    lat_min::TEXT, lat_max::TEXT, 
                    lng_min::TEXT, lng_max::TEXT);
  
  -- Use a simple bounding box search for better performance
  RETURN QUERY
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
                 sin(radians(cr.latitude)))) AS distance,
    -- Include debug information
    jsonb_build_object(
      'search_point', jsonb_build_object('lat', latitude, 'lng', longitude),
      'search_radius_km', radius_km,
      'bounding_box', jsonb_build_object(
        'lat_min', lat_min,
        'lat_max', lat_max,
        'lng_min', lng_min,
        'lng_max', lng_max
      ),
      'application_point', jsonb_build_object('lat', cr.latitude, 'lng', cr.longitude),
      'query_params', jsonb_build_object(
        'center_lat', latitude,
        'center_lng', longitude,
        'radius_km', radius_km
      )
    ) AS debug_info
  FROM crystal_roof cr
  WHERE 
    cr.latitude IS NOT NULL 
    AND cr.longitude IS NOT NULL
    AND cr.latitude BETWEEN lat_min AND lat_max
    AND cr.longitude BETWEEN lng_min AND lng_max
  ORDER BY distance ASC
  LIMIT result_limit;
  
  -- Record end time for performance logging
  end_time := clock_timestamp();
  execution_time := end_time - start_time;
  
  -- Log execution time and parameters
  RAISE NOTICE 'get_nearby_applications executed in % with params: lat=%, lng=%, radius=%km, result_limit=%',
    execution_time,
    latitude,
    longitude,
    radius_km,
    result_limit;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- Create index on latitude and longitude for faster searches
CREATE INDEX IF NOT EXISTS idx_crystal_roof_lat_lng 
ON crystal_roof (latitude, longitude);

-- Add a statement timeout to prevent long-running queries
ALTER FUNCTION get_nearby_applications SET statement_timeout = '15s';

