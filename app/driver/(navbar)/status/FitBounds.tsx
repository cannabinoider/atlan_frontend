import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { LatLngTuple, LatLngBounds } from "leaflet";

interface FitBoundsProps {
  routeCoordinates: LatLngTuple[];
  driverCoordinates: LatLngTuple;
}

const FitBounds: React.FC<FitBoundsProps> = ({ routeCoordinates, driverCoordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      const bounds = new LatLngBounds([...routeCoordinates, driverCoordinates]);
      map.fitBounds(bounds);
    }
  }, [map, routeCoordinates, driverCoordinates]);

  return null;
};

export default FitBounds;
