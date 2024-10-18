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
    Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getSelectedBooking } from "@/actions/api";

interface Coordinates {
    lat: number;
    lng: number;
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
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
            <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} />
            {driver && <Marker position={[driver.lat, driver.lng]} icon={driverIcon} />}
            {route.length > 0 && <Polyline positions={route} color="blue" />}
        </>
    );
};

export default function UserDashboard() {
    const [latestBooking, setLatestBooking] = useState<any>(null);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    const fetchBookings = async () => {
        try {
            const userId = localStorage.getItem("userid");
            console.log(userId);
            if (!userId) {
                setFetchError(true);
                return;
            }
            const data = await getSelectedBooking(parseInt(userId));
            console.log("API Response Data:", data);

            if (data && data.bookings && data.bookings.rows) {
                const latest = data.bookings.rows[data.bookings.rows.length - 1];
                setLatestBooking({
                    id: latest.id,
                    status: latest.status,
                    goodType: latest.good_type,
                    weight: `${latest.good_weight}kg`,
                    vehicleType: latest.vehicle_type,
                    cost: latest.payment_status,
                    pickupLocation: latest.pickup_location_address,
                    dropoffLocation: latest.dropoff_location_address,
                    pickupCoordinates: {
                        lat: parseFloat(latest.pickup_geolocation.split(',')[0]),
                        lng: parseFloat(latest.pickup_geolocation.split(',')[1]),
                    },
                    dropoffCoordinates: {
                        lat: parseFloat(latest.dropoff_geolocation.split(',')[0]),
                        lng: parseFloat(latest.dropoff_geolocation.split(',')[1]),
                    },
                    driverCoordinates: {
                        lat: parseFloat(latest.latitude),
                        lng: parseFloat(latest.longitude),
                    },
                    route: latest.graphhopper_response.paths[0].points.coordinates.map((point: [number, number]) => [point[1], point[0]]), // Extracting route from graphhopper_response
                });
                setFetchError(false); 
            } else {
                console.error("Invalid data structure", data);
                setFetchError(true); 
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setFetchError(true); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(); 
    }, []);

    const handleAccordionChange = () => {
        setExpanded((prev) => !prev);
        if (!expanded && latestBooking) {
            setRoute(latestBooking.route);
        }
    };

    return (
        <div className="mx-5 mb-5 py-4 ml-[200px] mt-11 max-[1420px]:mx-10 max-lg:mx-5">
            <Typography variant="h4" gutterBottom>
                Current Booking Status
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : fetchError ? (
                <Box textAlign="center" mt={4}>
                    <Typography variant="h6">
                        No driver has yet accepted your bookings. Please try again later.
                    </Typography>
                    <Button style={{backgroundColor: "black", color: "white" }} variant="contained" onClick={fetchBookings} sx={{ mt: 2 }}>
                        Try Again
                    </Button>
                </Box>
            ) : latestBooking ? (
                <Accordion expanded={expanded} onChange={handleAccordionChange} sx={{ marginBottom: "20px" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Booking ID : {latestBooking.id} </Typography>
                        <Typography ml={2}>Status : {latestBooking.status} </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography>Good Type: {latestBooking.goodType}</Typography>
                                <Typography>Weight: {latestBooking.weight}</Typography>
                                <Typography>Cost: {latestBooking.cost}</Typography>
                                <Typography>Vehicle: {latestBooking.vehicleType}</Typography>
                                <Typography>Pickup: {latestBooking.pickupLocation}</Typography>
                                <Typography>Destination: {latestBooking.dropoffLocation}</Typography>

                                <div style={{ height: "400px", marginTop: "20px" }}>
                                    <MapContainer center={latestBooking.pickupCoordinates} zoom={10} style={{ height: "100%", width: "100%" }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <MapWithMarkers
                                            pickup={latestBooking.pickupCoordinates}
                                            dropoff={latestBooking.dropoffCoordinates}
                                            driver={latestBooking.driverCoordinates}
                                            route={route}
                                        />
                                    </MapContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </AccordionDetails>
                </Accordion>
            ) : (
                <Typography>No bookings yet</Typography>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message="An error occurred while fetching bookings."
            />
        </div>
    );
}
