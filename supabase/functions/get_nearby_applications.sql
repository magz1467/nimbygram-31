
-- Function to get nearby applications within a radius using PostGIS
CREATE OR REPLACE FUNCTION get_nearby_applications(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 20,
  result_limit INTEGER DEFAULT 500
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
AS $$
DECLARE
  center_point GEOGRAPHY;
  search_radius_meters DOUBLE PRECISION;
BEGIN
  -- Convert the center coordinates to a PostGIS geography point
  center_point := ST_MakeGeography(ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326));
  
  -- Convert radius to meters for PostGIS
  search_radius_meters := radius_km * 1000;
  
  RETURN QUERY
  SELECT *
  FROM crystal_roof
  WHERE
    -- Use ST_DWithin for accurate distance calculation with geography type
    ST_DWithin(
      center_point,
      ST_MakeGeography(ST_SetSRID(ST_MakePoint(
        CAST(longitude AS DOUBLE PRECISION), 
        CAST(latitude AS DOUBLE PRECISION)
      ), 4326)),
      search_radius_meters
    )
  ORDER BY
    -- Order by actual distance
    ST_Distance(
      center_point,
      ST_MakeGeography(ST_SetSRID(ST_MakePoint(
        CAST(longitude AS DOUBLE PRECISION), 
        CAST(latitude AS DOUBLE PRECISION)
      ), 4326))
    ) ASC
  LIMIT result_limit;
END;
$$;

-- Add spatial index to improve performance
CREATE INDEX IF NOT EXISTS crystal_roof_geo_idx 
ON crystal_roof USING GIST (
  ST_SetSRID(
    ST_MakePoint(
      CAST(longitude AS DOUBLE PRECISION),
      CAST(latitude AS DOUBLE PRECISION)
    ), 4326
  )::geography
);
