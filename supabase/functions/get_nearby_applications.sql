
CREATE OR REPLACE FUNCTION get_nearby_applications(
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10
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
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_point GEOMETRY;
  has_geom BOOLEAN;
BEGIN
  -- Create the search point
  search_point := ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
  
  -- Check if geom column exists and has data
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crystal_roof' AND column_name = 'geom'
  ) INTO has_geom;
  
  IF has_geom THEN
    -- Use geometry-based search if geom column exists
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
      ST_Distance(cr.geom::geography, search_point::geography) / 1000 AS distance
    FROM crystal_roof cr
    WHERE 
      cr.geom IS NOT NULL
      AND ST_DWithin(
        cr.geom::geography,
        search_point::geography,
        radius_km * 1000  -- Convert km to meters for ST_DWithin
      )
    ORDER BY
      ST_Distance(cr.geom::geography, search_point::geography) ASC
    LIMIT 500;
  ELSE
    -- Fallback to lat/long distance calculation if no geom column
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
      (6371 * ACOS(
        COS(RADIANS(latitude)) * 
        COS(RADIANS(cr.latitude)) * 
        COS(RADIANS(cr.longitude) - RADIANS(longitude)) + 
        SIN(RADIANS(latitude)) * 
        SIN(RADIANS(cr.latitude))
      )) AS distance
    FROM crystal_roof cr
    WHERE 
      cr.latitude IS NOT NULL 
      AND cr.longitude IS NOT NULL
      AND cr.latitude BETWEEN (latitude - radius_km/111.0) AND (latitude + radius_km/111.0)
      AND cr.longitude BETWEEN (longitude - radius_km/(111.0 * COS(RADIANS(latitude)))) 
                          AND (longitude + radius_km/(111.0 * COS(RADIANS(latitude))))
    ORDER BY
      (6371 * ACOS(
        COS(RADIANS(latitude)) * 
        COS(RADIANS(cr.latitude)) * 
        COS(RADIANS(cr.longitude) - RADIANS(longitude)) + 
        SIN(RADIANS(latitude)) * 
        SIN(RADIANS(cr.latitude))
      )) ASC
    LIMIT 500;
  END IF;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_nearby_applications TO anon, authenticated;
