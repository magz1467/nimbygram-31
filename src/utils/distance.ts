
import { LatLngTuple } from "leaflet";
import { Application } from "@/types/planning";

export const calculateDistance = (point1: LatLngTuple, point2: LatLngTuple): number => {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  // Using the Haversine formula to calculate distance
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  console.log('Distance calculation:', {
    point1: point1,
    point2: point2,
    distance: distance.toFixed(2) + 'km'
  });

  return distance;
};

export const findClosestApplication = (
  applications: Application[],
  coordinates: LatLngTuple,
  applicationCoordinates: LatLngTuple[]
): number => {
  let closestDistance = Infinity;
  let closestId = applications[0]?.id;

  applications.forEach((app, index) => {
    const distance = calculateDistance(coordinates, applicationCoordinates[index]);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestId = app.id;
    }
  });

  return closestId;
};
