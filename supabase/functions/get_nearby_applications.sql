
CREATE OR REPLACE FUNCTION get_nearby_applications(
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_point GEOMETRY;
BEGIN
  -- Create the search point
  search_point := ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
  
  -- Return applications within radius using PostGIS
  RETURN QUERY
  SELECT cr.*
  FROM crystal_roof cr
  WHERE 
    cr.geom IS NOT NULL
    AND ST_DWithin(
      cr.geom::geography,
      search_point::geography,
      radius_km * 1000  -- Convert km to meters for ST_DWithin
    )
  ORDER BY
    ST_Distance(
      cr.geom::geography,
      search_point::geography
    ) ASC
  LIMIT 500;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;
