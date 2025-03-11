
-- Function to get nearby applications within a radius using PostGIS
CREATE OR REPLACE FUNCTION get_nearby_applications(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 20
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
AS $$
DECLARE
  center_point GEOGRAPHY;
  search_radius_meters DOUBLE PRECISION;
BEGIN
  -- Convert the center coordinates to a PostGIS point
  center_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::GEOGRAPHY;
  
  -- Convert radius to meters for PostGIS
  search_radius_meters := radius_km * 1000;
  
  RETURN QUERY
  SELECT *
  FROM crystal_roof
  WHERE
    -- First quick filter by bounding box for performance
    center_lat - (radius_km / 111.32) <= CAST(latitude AS DOUBLE PRECISION) AND
    center_lat + (radius_km / 111.32) >= CAST(latitude AS DOUBLE PRECISION) AND
    center_lng - (radius_km / (111.32 * COS(RADIANS(center_lat)))) <= CAST(longitude AS DOUBLE PRECISION) AND
    center_lng + (radius_km / (111.32 * COS(RADIANS(center_lat)))) >= CAST(longitude AS DOUBLE PRECISION)
  ORDER BY
    -- Calculate actual distance for sorting
    ST_Distance(
      center_point,
      ST_SetSRID(ST_MakePoint(CAST(longitude AS DOUBLE PRECISION), CAST(latitude AS DOUBLE PRECISION)), 4326)::GEOGRAPHY
    ) ASC
  LIMIT 500;
END;
$$;
