
-- Function to get nearby applications within a radius
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
BEGIN
  -- Convert the center coordinates to a PostGIS point
  center_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::GEOGRAPHY;
  
  RETURN QUERY
  SELECT *
  FROM crystal_roof
  WHERE
    -- First filter by bounding box for performance (quick filter)
    center_lat - (radius_km / 111.32) <= CAST(latitude AS DOUBLE PRECISION) AND
    center_lat + (radius_km / 111.32) >= CAST(latitude AS DOUBLE PRECISION) AND
    center_lng - (radius_km / (111.32 * COS(RADIANS(center_lat)))) <= CAST(longitude AS DOUBLE PRECISION) AND
    center_lng + (radius_km / (111.32 * COS(RADIANS(center_lat)))) >= CAST(longitude AS DOUBLE PRECISION)
  ORDER BY
    -- Order by distance for closer results first
    (center_lat - CAST(latitude AS DOUBLE PRECISION))^2 + 
    (center_lng - CAST(longitude AS DOUBLE PRECISION))^2
  LIMIT 500;
END;
$$;

-- Version using PostGIS if geometry columns exist
CREATE OR REPLACE FUNCTION get_nearby_applications_postgis(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 20
)
RETURNS SETOF crystal_roof
LANGUAGE plpgsql
AS $$
DECLARE
  center_point GEOGRAPHY;
  search_radius DOUBLE PRECISION;
BEGIN
  -- Convert radius to meters for PostGIS
  search_radius := radius_km * 1000;
  
  -- Convert the center coordinates to a PostGIS point
  center_point := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::GEOGRAPHY;
  
  RETURN QUERY
  SELECT *
  FROM crystal_roof
  WHERE
    -- Use proper PostGIS distance function if geom column exists
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crystal_roof' AND column_name = 'geom'
      ) THEN
        ST_DWithin(geom::GEOGRAPHY, center_point, search_radius)
      -- Fall back to simpler calculation if no geometry column
      ELSE
        center_lat - (radius_km / 111.32) <= CAST(latitude AS DOUBLE PRECISION) AND
        center_lat + (radius_km / 111.32) >= CAST(latitude AS DOUBLE PRECISION) AND
        center_lng - (radius_km / (111.32 * COS(RADIANS(center_lat)))) <= CAST(longitude AS DOUBLE PRECISION) AND
        center_lng + (radius_km / (111.32 * COS(RADIANS(center_lat)))) >= CAST(longitude AS DOUBLE PRECISION)
    END
  ORDER BY
    -- Order by distance using PostGIS if available
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crystal_roof' AND column_name = 'geom'
      ) THEN
        ST_Distance(geom::GEOGRAPHY, center_point)
      ELSE
        (center_lat - CAST(latitude AS DOUBLE PRECISION))^2 + 
        (center_lng - CAST(longitude AS DOUBLE PRECISION))^2
    END
  LIMIT 500;
END;
$$;
