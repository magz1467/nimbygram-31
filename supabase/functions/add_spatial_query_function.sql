
-- Function to get nearby applications within a radius using PostGIS
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
BEGIN
  -- Use a simple bounding box search for better performance
  -- The bounding box is approximately the radius in degrees
  RETURN QUERY
  SELECT cr.*
  FROM crystal_roof cr
  WHERE 
    -- Only include points that have both latitude and longitude
    cr.latitude IS NOT NULL AND
    cr.longitude IS NOT NULL AND
    -- Use a simpler bounding box approach for better performance
    cr.latitude BETWEEN center_lat - (radius_km/111.0) AND center_lat + (radius_km/111.0) AND
    cr.longitude BETWEEN center_lng - (radius_km/(111.0 * COS(RADIANS(center_lat)))) AND center_lng + (radius_km/(111.0 * COS(RADIANS(center_lat))))
  ORDER BY
    -- Calculate distance using haversine formula
    SQRT(
      POW(69.1 * (cr.latitude - center_lat), 2) +
      POW(69.1 * (cr.longitude - center_lng) * COS(center_lat / 57.3), 2)
    ) ASC
  LIMIT result_limit;
END;
$$;

-- Add permissions for anonymous and authenticated users to use the function
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- Create index on latitude and longitude for faster searches
CREATE INDEX IF NOT EXISTS idx_crystal_roof_lat_lng 
ON crystal_roof (latitude, longitude);
