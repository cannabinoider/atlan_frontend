"use client";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

delete (L.Icon.Default as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Coordinates {
    lat: number;
    lng: number;
}

interface MapProps {
    pickupCoordinates: Coordinates | null;
    dropoffCoordinates: Coordinates | null;
}

const FitToRoute = ({ route }: { route: [number, number][] }) => {
    const map = useMap();

    useEffect(() => {
        if (route.length > 0) {
            const bounds: [number, number][] = route.map((point) => [point[0], point[1]] as [number, number]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [route, map]);

    return null;
};

const Map: React.FC<MapProps> = ({ pickupCoordinates, dropoffCoordinates }) => {
    const [route, setRoute] = useState<[number, number][]>([]);

    useEffect(() => {
        const fetchRoute = async () => {
            if (pickupCoordinates && dropoffCoordinates) {
                const apiKey = `${process.env.NEXT_PUBLIC_API_KEY}`;
                const response = await fetch(
                    `https://graphhopper.com/api/1/route?point=${pickupCoordinates.lat},${pickupCoordinates.lng}&point=${dropoffCoordinates.lat},${dropoffCoordinates.lng}&vehicle=car&locale=en&points_encoded=false&key=${apiKey}`
                );

                if (response.ok) {
                    const data = await response.json();
                    const points = data.paths[0].points.coordinates.map((point: any) => [point[1], point[0]]);
                    setRoute(points);
                    console.log("first route", setRoute);
                } else {
                    console.error("Failed to fetch route");
                }
            }
        };

        fetchRoute();
    }, [pickupCoordinates, dropoffCoordinates]);

    return (
        <div style={{ height: "400px", marginTop: "20px" }}>
            <MapContainer center={[22.57, 78.96]} zoom={5} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {pickupCoordinates && <Marker position={[pickupCoordinates.lat, pickupCoordinates.lng]} />}
                {dropoffCoordinates && <Marker position={[dropoffCoordinates.lat, dropoffCoordinates.lng]} />}
                {route.length > 0 && <Polyline positions={route} color="blue" />}
                {route.length > 0 && <FitToRoute route={route} />}
            </MapContainer>
        </div>
    );
};

export default Map;
