"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
import { getSelectedBooking } from "@/actions/api";
import { getAuth } from "@/actions/cookie";
import { parseJwt } from "@/actions/utils";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const MapWithMarkers = dynamic(() => import('./MapWithMarkers'), { ssr: false });

export default function UserDashboard() {
    const [latestBooking, setLatestBooking] = useState<any>(null);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const token = await getAuth();
            const data = parseJwt(token);
            setUserId(data.userId);
            console.log("User ID:", data.userId);
        };
        fetchData();
    }, []);

    const fetchBookings = async () => {
        try {
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
                        lat: parseFloat(latest.pickup_geolocation.split(",")[0]),
                        lng: parseFloat(latest.pickup_geolocation.split(",")[1]),
                    },
                    dropoffCoordinates: {
                        lat: parseFloat(latest.dropoff_geolocation.split(",")[0]),
                        lng: parseFloat(latest.dropoff_geolocation.split(",")[1]),
                    },
                    driverCoordinates: {
                        lat: parseFloat(latest.latitude),
                        lng: parseFloat(latest.longitude),
                    },
                    route: latest.graphhopper_response.paths[0].points.coordinates.map((point: [number, number]) => [
                        point[1],
                        point[0],
                    ]), 
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
    }, [userId]);

    const handleAccordionChange = () => {
        setExpanded(prev => !prev);
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
                    <Button style={{ backgroundColor: "black", color: "white" }} variant="contained" onClick={fetchBookings} sx={{ mt: 2 }}>
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
