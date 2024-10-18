"use client";
import React, { useState, useEffect } from "react";
import {
    Box,
    Tabs,
    Tab,
    Typography,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Card,
    CardContent,
    Autocomplete,
    CircularProgress,
    Snackbar,
    Grid,
} from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { MapContainer, TileLayer, Polyline, Marker, useMap, Popup } from 'react-leaflet'; // Import Marker
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Coordinates {
    lat: number;
    lng: number;
}

export default function UserDashboard() {
    const [tabValue, setTabValue] = useState(0);
    const [goodType, setGoodType] = useState("");
    const [weight, setWeight] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");
    const [dropoffLocation, setDropoffLocation] = useState("");
    const [pickupCoordinates, setPickupCoordinates] = useState<Coordinates | null>(null);
    const [dropoffCoordinates, setDropoffCoordinates] = useState<Coordinates | null>(null);
    const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
    const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(false);
    const username = localStorage.getItem('username');
    const [estimatedCost] = useState(1000); 
    const [userAmount, setUserAmount] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
    const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);


    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };
    
    const fetchCoordinates = async (location: string) => {
        const apiKey = `${process.env.NEXT_PUBLIC_API_KEY}`;
        const response = await fetch(
            `https://graphhopper.com/api/1/geocode?q=${encodeURIComponent(location)}&key=${apiKey}`
        );

        if (!response.ok) {
            console.error("Failed to fetch coordinates");
            return [];
        }

        const data = await response.json();
        //console.log("data",data);
        return data.hits.map((hit: any) => ({
            name: hit.name,
            point: hit.point as Coordinates, 
        }));
    };

    const handleLocationChange = async (locationType: "pickup" | "dropoff", value: string) => {
        if (locationType === "pickup") {
            setPickupLocation(value);
            const suggestions = await fetchCoordinates(value);
            setPickupSuggestions(suggestions);
        } else if (locationType === "dropoff") {
            setDropoffLocation(value);
            const suggestions = await fetchCoordinates(value);
            setDropoffSuggestions(suggestions);
        }
    };

    const handlePickupSelect = (suggestion: any) => {
        if (suggestion) {
            setPickupLocation(suggestion.name);
            setPickupCoordinates(suggestion.point);
        }
    };

    const handleDropoffSelect = (suggestion: any) => {
        if (suggestion) {
            setDropoffLocation(suggestion.name);
            setDropoffCoordinates(suggestion.point);
        }
    };

    const fetchRoute = async () => {
        if (!pickupCoordinates || !dropoffCoordinates) return;

        setLoading(true);
        const response = await fetch(
            `https://graphhopper.com/api/1/route?point=${pickupCoordinates.lat},${pickupCoordinates.lng}&point=${dropoffCoordinates.lat},${dropoffCoordinates.lng}&vehicle=car&locale=en&points_encoded=false&key=${process.env.NEXT_PUBLIC_API_KEY}`
        );

        if (!response.ok) {
            console.error("Failed to fetch route");
            setLoading(false);
            return;
        }

        const data = await response.json();
        const points = data.paths[0].points.coordinates.map((point: [number, number]) => [point[1], point[0]]);
        setRoute(points);
        setLoading(false);
    };

    useEffect(() => {
        if (pickupCoordinates && dropoffCoordinates) {
            fetchRoute();
        }
    }, [pickupCoordinates, dropoffCoordinates]);

    const handleBookingSubmit = (event: React.FormEvent) => {
        event.preventDefault();
    
        if (userAmount === estimatedCost.toString()) {
            setSnackbarOpen(true);
            setIsPaymentProcessed(true); 
        } else {
            alert("Entered amount does not match the estimated cost.");
        }
    };
    const allFieldsFilled = () => {
        return goodType && weight && vehicleType && pickupLocation && dropoffLocation;
    };
    
    const handleConfirmBooking = () => {
        if (isPaymentProcessed) {
            setIsBookingConfirmed(true);
            console.log({
                goodType,
                weight,
                vehicleType,
                pickupLocation,
                dropoffLocation,
                pickupCoordinates,
                dropoffCoordinates,
                estimatedCost
            });
        }
    };
    
    <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message="Payment Done"
    />

    const MapWithMarkers = ({ pickup, dropoff, route }: any) => {
        const map = useMap();
        const [pickupPosition, setPickupPosition] = useState<any>(null);
        const [dropoffPosition, setDropoffPosition] = useState<any>(null);
    
        useEffect(() => {
            const updatePositions = () => {
                if (pickup) {
                    setPickupPosition(map.latLngToContainerPoint([pickup.lat, pickup.lng]));
                }
                if (dropoff) {
                    setDropoffPosition(map.latLngToContainerPoint([dropoff.lat, dropoff.lng]));
                }
            };
    
            map.on('moveend', updatePositions);
            updatePositions();
            return () => {
                map.off('moveend', updatePositions);
            };
        }, [pickup, dropoff, map]);
    
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
                {pickupPosition && (
                    <div
                        style={{
                            position: 'absolute',
                            left: `${pickupPosition.x}px`,
                            top: `${pickupPosition.y}px`,
                            transform: 'translate(-50%, -100%)',
                            zIndex: 1000,
                        }}
                    >
                        <LocationOnIcon style={{ color: "green", fontSize: "30px" }} />
                    </div>
                )}
                {dropoffPosition && (
                    <div
                        style={{
                            position: 'absolute',
                            left: `${dropoffPosition.x}px`,
                            top: `${dropoffPosition.y}px`,
                            transform: 'translate(-50%, -100%)',
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
                    TabIndicatorProps={{ style: { backgroundColor: "black" } }}
                    textColor="inherit"
                    sx={{
                        ".MuiTab-root": { color: "black" },
                        ".Mui-selected": { color: "black" },
                    }}
                >
                    <Tab label="Booking" />
                    {/* <Tab label="Status" /> */}
                </Tabs>

                {tabValue === 0 && (
                    <Card variant="outlined" className="mt-2">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Create your Booking
                            </Typography>
                            <Box component="form" onSubmit={handleBookingSubmit}>
                                <FormControl
                                    fullWidth
                                    margin="normal"
                                    sx={{
                                        ".MuiOutlinedInput-root": {
                                            "& fieldset": { borderColor: "black" },
                                            "&:hover fieldset": { borderColor: "black" },
                                            "&.Mui-focused fieldset": { borderColor: "black" },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        id="good-type-label"
                                        sx={{
                                            color: "black",
                                            "&.Mui-focused": { color: "black" },
                                        }}
                                    >
                                        Type of Goods
                                    </InputLabel>
                                    <Select
                                        labelId="good-type-label"
                                        value={goodType}
                                        onChange={(e) => setGoodType(e.target.value)}
                                        required
                                    >
                                        <MenuItem value="perishable">Perishable</MenuItem>
                                        <MenuItem value="non-perishable">Non-Perishable</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Weight (kg)"
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    required
                                    sx={{
                                        ".MuiOutlinedInput-root": {
                                            "& fieldset": { borderColor: "black" },
                                            "&:hover fieldset": { borderColor: "black" },
                                            "&.Mui-focused fieldset": { borderColor: "black" },
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "black",
                                            "&.Mui-focused": { color: "black" },
                                        },
                                    }}
                                />

                                <FormControl
                                    fullWidth
                                    margin="normal"
                                    sx={{
                                        ".MuiOutlinedInput-root": {
                                            "& fieldset": { borderColor: "black" },
                                            "&:hover fieldset": { borderColor: "black" },
                                            "&.Mui-focused fieldset": { borderColor: "black" },
                                        },
                                    }}
                                >
                                    <InputLabel
                                        id="vehicle-type-label"
                                        sx={{
                                            color: "black",
                                            "&.Mui-focused": { color: "black" },
                                        }}
                                    >
                                        Vehicle Type
                                    </InputLabel>
                                    <Select
                                        labelId="vehicle-type-label"
                                        value={vehicleType}
                                        onChange={(e) => setVehicleType(e.target.value)}
                                        required
                                    >
                                        <MenuItem value="light">Light</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="heavy">Heavy</MenuItem>
                                    </Select>
                                </FormControl>

                                <Autocomplete
                                    freeSolo
                                    options={pickupSuggestions}
                                    getOptionLabel={(option) => option.name}
                                    onInputChange={(_, value) => handleLocationChange("pickup", value)}
                                    onChange={(_, value) => handlePickupSelect(value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Pickup Location"
                                            fullWidth
                                            margin="normal"
                                            required
                                            sx={{
                                                ".MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "black" },
                                                    "&:hover fieldset": { borderColor: "black" },
                                                    "&.Mui-focused fieldset": { borderColor: "black" },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "black",
                                                    "&.Mui-focused": { color: "black" },
                                                },
                                            }}
                                        />
                                    )}
                                />

                                <Autocomplete
                                    freeSolo
                                    options={dropoffSuggestions}
                                    getOptionLabel={(option) => option.name}
                                    onInputChange={(_, value) => handleLocationChange("dropoff", value)}
                                    onChange={(_, value) => handleDropoffSelect(value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Dropoff Location"
                                            fullWidth
                                            margin="normal"
                                            required
                                            sx={{
                                                ".MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "black" },
                                                    "&:hover fieldset": { borderColor: "black" },
                                                    "&.Mui-focused fieldset": { borderColor: "black" },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "black",
                                                    "&.Mui-focused": { color: "black" },
                                                },
                                            }}
                                        />
                                    )}
                                />

                                <div style={{ height: "400px", marginTop: '20px', marginBottom:'20px' }}>
                                <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <MapWithMarkers pickup={pickupCoordinates} dropoff={dropoffCoordinates} route={route} />
                                    </MapContainer>
                                </div>
                                
                                <TextField
                                            label="Estimated Cost"
                                            type="number"
                                            value={estimatedCost}
                                            fullWidth
                                            margin="normal"
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            sx={{
                                                ".MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "black" },
                                                    "&:hover fieldset": { borderColor: "black" },
                                                    "&.Mui-focused fieldset": { borderColor: "black" },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "black",
                                                    "&.Mui-focused": { color: "black" },
                                                },
                                            }}
                                        />

                                        <TextField
                                            label="Enter Payment Amount"
                                            type="number"
                                            value={userAmount}
                                            onChange={(e) => setUserAmount(e.target.value)}
                                            fullWidth
                                            margin="normal"
                                            disabled={!allFieldsFilled()} 
                                            required
                                            sx={{
                                                ".MuiOutlinedInput-root": {
                                                    "& fieldset": { borderColor: "black" },
                                                    "&:hover fieldset": { borderColor: "black" },
                                                    "&.Mui-focused fieldset": { borderColor: "black" },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "black",
                                                    "&.Mui-focused": { color: "black" },
                                                },
                                            }}
                                        />
                                        <div className="flex space-x-2 mt-5">
                                            <div className="flex-1">
                                                <Button
                                                    onClick={handleBookingSubmit}
                                                    variant="contained"
                                                    style={{ backgroundColor: "black", color: "white" }}
                                                    className={`w-full ${isPaymentProcessed ? "bg-gray-800 cursor-not-allowed" : "bg-black"} text-white ${isPaymentProcessed ? "filter blur-sm" : ""}`} 
                                                    disabled={isPaymentProcessed} 
                                                >
                                                    Process Payment
                                                </Button>
                                            </div>
                                            <div className="flex-1">
                                                <Button
                                                    onClick={handleConfirmBooking}
                                                    variant="contained"
                                                    style={{backgroundColor: "black", color: "white" }}
                                                    className={`w-full ${!isPaymentProcessed || isBookingConfirmed ? "bg-gray-800 cursor-not-allowed" : "bg-black"} text-white ${(!isPaymentProcessed || isBookingConfirmed) ? "filter blur-sm" : ""}`} 
                                                    disabled={!isPaymentProcessed || isBookingConfirmed} 
                                                >
                                                    Confirm Booking
                                                </Button>
                                            </div>
                                    </div>
                                                  
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                        <CircularProgress />
                    </Box>
                )}
                {/* {tabValue === 1 && (
                    <div className="mt-2">
                    <Typography variant="h6">Status Tab Content</Typography>
                </div>
                )} */}

            </div>
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
