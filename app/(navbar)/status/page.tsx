"use client";
import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Snackbar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    CardContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Coordinates {
    lat: number;
    lng: number;
}

const dummyBookings = [
    {
        id: "BK1234",
        status: "In Transit",
        goodType: "Electronics",
        weight: "150kg",
        vehicleType: "Truck",
        cost: "1200",
        pickupLocation:"Delhi",
        dropoffLocation:"Mumbai",
        pickupCoordinates: { lat: 28.7041, lng: 77.1025 }, // Delhi
        dropoffCoordinates: { lat: 19.0760, lng: 72.8777 }, // Mumbai
        driverCoordinates: { lat: 24.5854, lng: 73.7125 }, // Rajasthan
    },
    {
        id: "BK5678",
        status: "Waiting for Pickup",
        goodType: "Furniture",
        weight: "300kg",
        vehicleType: "Van",
        cost: "800",
        pickupLocation:"Chennai",
        dropoffLocation:"Hubli",
        pickupCoordinates: { lat: 13.0827, lng: 80.2707 }, // Chennai
        dropoffCoordinates: { lat: 15.3173, lng: 75.7139 }, // Hubli
        driverCoordinates: { lat: 14.9129, lng: 77.0080 }, // Somewhere near Bangalore
    },
];

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

const fetchBookingDetails = (bookingId: string) => {
    const booking = dummyBookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    return {
        pickupCoordinates: booking.pickupCoordinates,
        dropoffCoordinates: booking.dropoffCoordinates,
        driverCoordinates: booking.driverCoordinates,
    };
};

const fetchRoute = async (pickup: Coordinates, dropoff: Coordinates) => {
    const apiKey = `${process.env.NEXT_PUBLIC_API_KEY}`;
    const response = await fetch(
        `https://graphhopper.com/api/1/route?point=${pickup.lat},${pickup.lng}&point=${dropoff.lat},${dropoff.lng}&vehicle=car&locale=en&points_encoded=false&key=${apiKey}`
    );

    if (!response.ok) {
        console.error("Failed to fetch route");
        return [];
    }

    const data = await response.json();
    return data.paths[0].points.coordinates.map((point: [number, number]) => [point[1], point[0]]);
};

const MapWithMarkers = ({ pickup, dropoff, driver, route }: any) => {
    const map = useMap();

    useEffect(() => {
        if (pickup && dropoff) {
            const bounds = L.latLngBounds([
                [pickup.lat, pickup.lng],
                [dropoff.lat, dropoff.lng],
            ]);
            map.fitBounds(bounds);
        }

        if (route.length > 0) {
            const routeBounds = L.latLngBounds(route.map((point: [number, number]) => [point[0], point[1]]));
            map.fitBounds(routeBounds);
        }
    }, [pickup, dropoff, route, map]);

    return (
        <>
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}></Marker>
            <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}></Marker>
            {driver && (
                <Marker position={[driver.lat, driver.lng]} icon={driverIcon}></Marker>
            )}
            {route.length > 0 && <Polyline positions={route} color="blue" />}
        </>
    );
};

export default function UserDashboard() {
    const [expandedBooking, setExpandedBooking] = useState<string | false>(false);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleAccordionChange = (bookingId: string) => async () => {
        setExpandedBooking((prev) => (prev === bookingId ? false : bookingId));

        const bookingDetails = fetchBookingDetails(bookingId);
        if (bookingDetails) {
            setLoading(true);
            const fetchedRoute = await fetchRoute(bookingDetails.pickupCoordinates, bookingDetails.dropoffCoordinates);
            setRoute(fetchedRoute);
            setLoading(false);
        }
    };

    return (
        <div className="mx-5 mb-5 py-4 ml-[200px] mt-11 max-[1420px]:mx-10 max-lg:mx-5">
            <Typography variant="h4" gutterBottom>
                Current Booking Status
            </Typography>

            {dummyBookings.map((booking) => (
                <Accordion key={booking.id} expanded={expandedBooking === booking.id} onChange={handleAccordionChange(booking.id)} sx={{ marginBottom: "20px" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Typography>Booking ID: {booking.id}</Typography>
                        <Typography>Status: {booking.status}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography>Good Type: {booking.goodType}</Typography>
                                <Typography>Weight: {booking.weight}</Typography>
                                <Typography>Cost: {booking.cost}</Typography>
                                <Typography>Vehicle: {booking.vehicleType}</Typography>
                                <Typography>Pickup: {booking.pickupLocation}</Typography>
                                <Typography>Destination: {booking.dropoffLocation}</Typography>

                                <div style={{ height: "400px", marginTop: "20px" }}>
                                    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <MapWithMarkers
                                            pickup={booking.pickupCoordinates}
                                            dropoff={booking.dropoffCoordinates}
                                            driver={booking.driverCoordinates}
                                            route={route}
                                        />
                                    </MapContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </AccordionDetails>
                </Accordion>
            ))}

            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                    <CircularProgress />
                </Box>
            )}

            {snackbarOpen && (
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    message="Payment Done"
                />
            )}
        </div>
    );
}
