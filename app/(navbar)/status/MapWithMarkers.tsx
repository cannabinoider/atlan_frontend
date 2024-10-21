import React from "react";
import { Polyline, Marker } from "react-leaflet";
import L from "leaflet";

interface Coordinates {
    lat: number;
    lng: number;
}

interface MapWithMarkersProps {
    pickup: Coordinates;
    dropoff: Coordinates;
    driver: Coordinates;
    route: [number, number][];
}

const createCustomIcon = (color: string) => {
    return L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

const pickupIcon = createCustomIcon("green");
const dropoffIcon = createCustomIcon("red");
const driverIcon = createCustomIcon("blue");

const MapWithMarkers: React.FC<MapWithMarkersProps> = ({ pickup, dropoff, driver, route }) => {
    return (
        <>
            <Marker position={pickup} icon={pickupIcon} />
            <Marker position={dropoff} icon={dropoffIcon} />
            <Marker position={driver} icon={driverIcon} />
            <Polyline positions={route} color="blue" />
        </>
    );
};

export default MapWithMarkers;
