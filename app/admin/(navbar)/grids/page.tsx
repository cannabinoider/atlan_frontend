"use client";
import React, { useState, useEffect } from "react";
import {
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    CircularProgress,
} from "@mui/material";
import { getDriversData, getBookingData } from "@/actions/api";

interface Booking {
  id: string;
  pickup_location_address: string;
  dropoff_location_address: string;
  payment_status: string;
  vehicle_type: string;
  good_weight: number;
  good_type: string;
  created_at: string;
}

interface Driver {
  booking_id: string;
  pickup_location_address: string;
  dropoff_location_address: string;
  payment_status: string;
  vehicle_type: string;
  good_weight: number;
  good_type: string;
  driver_id: string;
  user_id: string;
  created_at: string;
}

export default function UserDashboard() {
    const [tabValue, setTabValue] = useState(0);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);

    useEffect(() => {
        const fetchDrivers = async () => {
            setIsLoadingDrivers(true);
            try {
                const data = await getDriversData();
                setDrivers(data.vehicle);
            } catch (error) {
                console.error("Failed to fetch drivers:", error);
            } finally {
                setIsLoadingDrivers(false);
            }
        };
        if (tabValue === 1) fetchDrivers();
    }, [tabValue]);

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoadingBookings(true);
            try {
                const data = await getBookingData();
                setBookings(data.vehicle);
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
            } finally {
                setIsLoadingBookings(false);
            }
        };
        if (tabValue === 0) fetchBookings();
    }, [tabValue]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box className="mx-5 ml-[250px] mt-11 max-[1420px]:mx-10 max-lg:mx-5">
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Dashboard Tabs">
                <Tab label="Booking" />
                <Tab label="Driver" />
            </Tabs>

            {tabValue === 0 && (
                <Box mt={2}>
                    <Typography variant="h4" gutterBottom>
                        Booking Management
                    </Typography>

                    {isLoadingBookings ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Booking ID</TableCell>
                                        <TableCell>Pickup Location</TableCell>
                                        <TableCell>Dropoff Location</TableCell>
                                        <TableCell>Payment Status</TableCell>
                                        <TableCell>Vehicle Type</TableCell>
                                        <TableCell>Good Weight</TableCell>
                                        <TableCell>Good Type</TableCell>
                                        <TableCell>Created At</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>{booking.id}</TableCell>
                                            <TableCell>{booking.pickup_location_address}</TableCell>
                                            <TableCell>{booking.dropoff_location_address}</TableCell>
                                            <TableCell>{booking.payment_status}</TableCell>
                                            <TableCell>{booking.vehicle_type}</TableCell>
                                            <TableCell>{booking.good_weight}</TableCell>
                                            <TableCell>{booking.good_type}</TableCell>
                                            <TableCell>{booking.created_at}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={bookings.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </>
                    )}
                </Box>
            )}

            {tabValue === 1 && (
                <Box mt={2}>
                    <Typography variant="h4" gutterBottom>
                        Driver Management
                    </Typography>

                    {isLoadingDrivers ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Booking ID</TableCell>
                                        <TableCell>Pickup Location</TableCell>
                                        <TableCell>Dropoff Location</TableCell>
                                        <TableCell>Payment Status</TableCell>
                                        <TableCell>Vehicle Type</TableCell>
                                        <TableCell>Good Weight</TableCell>
                                        <TableCell>Good Type</TableCell>
                                        <TableCell>Driver ID</TableCell>
                                        <TableCell>User ID</TableCell>
                                        <TableCell>Created At</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {drivers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((driver) => (
                                        <TableRow key={driver.driver_id}>
                                            <TableCell>{driver.booking_id}</TableCell>
                                            <TableCell>{driver.pickup_location_address}</TableCell>
                                            <TableCell>{driver.dropoff_location_address}</TableCell>
                                            <TableCell>{driver.payment_status}</TableCell>
                                            <TableCell>{driver.vehicle_type}</TableCell>
                                            <TableCell>{driver.good_weight}</TableCell>
                                            <TableCell>{driver.good_type}</TableCell>
                                            <TableCell>{driver.driver_id}</TableCell>
                                            <TableCell>{driver.user_id}</TableCell>
                                            <TableCell>{driver.created_at}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={drivers.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </>
                    )}
                </Box>
            )}
        </Box>
    );
}
