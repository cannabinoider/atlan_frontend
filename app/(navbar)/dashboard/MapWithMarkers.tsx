import { useEffect, useState } from "react";
import { useMap, Polyline } from "react-leaflet";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import L from "leaflet";

const MapWithMarkers = ({ pickup, dropoff, route }: any) => {
  const map = useMap();
  const [pickupPosition, setPickupPosition] = useState<any>(null);
  const [dropoffPosition, setDropoffPosition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updatePositions = () => {
        if (pickup) {
          setPickupPosition(
            map.latLngToContainerPoint([pickup.lat, pickup.lng])
          );
        }
        if (dropoff) {
          setDropoffPosition(
            map.latLngToContainerPoint([dropoff.lat, dropoff.lng])
          );
        }
      };

      map.on("moveend", updatePositions);
      updatePositions(); 

      return () => {
        map.off("moveend", updatePositions); 
      };
    }
  }, [map, pickup, dropoff]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (pickup && dropoff) {
        const bounds = L.latLngBounds([
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ]);
        map.fitBounds(bounds);
      }

      if (route.length > 0) {
        const routeBounds = L.latLngBounds(
          route.map((point: [number, number]) => [point[0], point[1]])
        );
        map.fitBounds(routeBounds);
      }
    }
  }, [pickup, dropoff, route, map]);

  return (
    <>
      {pickupPosition && (
        <div
          style={{
            position: "absolute",
            left: `${pickupPosition.x}px`,
            top: `${pickupPosition.y}px`,
            transform: "translate(-50%, -100%)",
            zIndex: 1000,
          }}
        >
          <LocationOnIcon style={{ color: "green", fontSize: "30px" }} />
        </div>
      )}
      {dropoffPosition && (
        <div
          style={{
            position: "absolute",
            left: `${dropoffPosition.x}px`,
            top: `${dropoffPosition.y}px`,
            transform: "translate(-50%, -100%)",
            zIndex: 1000,
          }}
        >
          <LocationOnIcon style={{ color: "red", fontSize: "30px" }} />
        </div>
      )}
      {route.length > 0 && <Polyline positions={route} color="blue" />}
    </>
  );
};

export default MapWithMarkers;
