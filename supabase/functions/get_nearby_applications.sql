
CREATE OR REPLACE FUNCTION get_nearby_applications(
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT cr.*
  FROM crystal_roof cr
  WHERE 
    cr.latitude IS NOT NULL 
    AND cr.longitude IS NOT NULL
    AND cr.latitude BETWEEN (latitude - radius_km/111.0) AND (latitude + radius_km/111.0)
    AND cr.longitude BETWEEN (longitude - radius_km/(111.0 * COS(RADIANS(latitude)))) 
                        AND (longitude + radius_km/(111.0 * COS(RADIANS(latitude))))
  ORDER BY
    SQRT(POW(111.0 * (cr.latitude - latitude), 2) + 
         POW(111.0 * COS(RADIANS(latitude)) * (cr.longitude - longitude), 2)) ASC
  LIMIT 500;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;
