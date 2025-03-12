
-- Simple and reliable function to get nearby applications
CREATE OR REPLACE FUNCTION get_nearby_applications(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple bounding box calculation for better performance
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
    (cr.latitude - center_lat)^2 + (cr.longitude - center_lng)^2 ASC
  LIMIT 100;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;

-- Create an index to speed up queries
CREATE INDEX IF NOT EXISTS idx_crystal_roof_coordinates 
ON crystal_roof(latitude, longitude);
