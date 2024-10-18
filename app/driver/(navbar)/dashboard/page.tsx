"use client";
import React, { useState, useEffect } from "react";
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Radio,
    RadioGroup,
    FormControlLabel,
} from "@mui/material";
import { getJobs } from "@/actions/api";  

interface BookingRequest {
    id: string;
    good_weight: number;
    good_type: string;
    vehicle_type: string;
    pickupLocation: string;
    dropoffLocation: string;
    payment_status: string;
}

export default function UserDashboard() {
    const [tabValue, setTabValue] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
    const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
    const username = localStorage.getItem('driverName');

    const fetchBookingRequests = async () => {
        try {
            const jobsData = await getJobs();  
            const rows = jobsData.jobs.rows; 
            const formattedJobs = rows.map((job: any) => ({
                id: job.id,
                good_weight: job.good_weight,
                good_type: job.good_type,
                vehicle_type: job.vehicle_type,
                pickupLocation: job.pickup_location_address,
                dropoffLocation: job.dropoff_location_address,
                payment_status: job.payment_status,
            }));
            
            setBookingRequests(formattedJobs);
        } catch (error) {
            console.error("Error fetching booking requests:", error);
        }
    };

    useEffect(() => {
        fetchBookingRequests();  
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setSelectedBooking(null);
    };

    const handleBookingAccept = () => {
        if (selectedBooking !== null) {
            const acceptedBooking = bookingRequests.find((request) => request.id === selectedBooking);
            console.log("Accepted Booking:", acceptedBooking);
            setSelectedBooking(null); 
        }
    };

    return (
        <div className="mx-5 ml-[200px] mt-11 max-[1420px]:mx-10 max-lg:mx-5">
            <div className="mx-5 mt-4">
                <Typography variant="h4" gutterBottom>
                    Welcome, {username}
                </Typography>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="User Dashboard Tabs"
                    TabIndicatorProps={{ style: { backgroundColor: 'black' } }}
                    textColor="inherit"
                    sx={{
                        '.MuiTab-root': { color: 'black' },
                        '.Mui-selected': { color: 'black' },
                    }}
                >
                    <Tab label="Booking Requests" />
                </Tabs>

                {tabValue === 0 && (
                    <Card variant="outlined" className="mt-2">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Accept a Booking
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Action</TableCell>
                                            <TableCell>Booking ID</TableCell>
                                            <TableCell>Pickup Location</TableCell>
                                            <TableCell>Dropoff Location</TableCell>
                                            <TableCell>Good Type</TableCell>
                                            <TableCell>Vehicle Type</TableCell>
                                            <TableCell>Payment Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bookingRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell>
                                                    <Radio
                                                        checked={selectedBooking === request.id}
                                                        onChange={() => setSelectedBooking(request.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>{request.id}</TableCell>
                                                <TableCell>{request.pickupLocation}</TableCell>
                                                <TableCell>{request.dropoffLocation}</TableCell>
                                                <TableCell>{request.good_type}</TableCell>
                                                <TableCell>{request.vehicle_type}</TableCell>
                                                <TableCell>{request.payment_status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleBookingAccept}
                                className="bg-black text-white mt-3"
                                disabled={selectedBooking === null}
                            >
                                Accept
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
