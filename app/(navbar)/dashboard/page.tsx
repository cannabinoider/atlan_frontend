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
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { addBooking } from "@/actions/api";
import { getAuth } from "@/actions/cookie";
import { parseJwt } from "@/actions/utils";
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";

const MapWithMarkers = dynamic(() => import('./MapWithMarkers'), {
    ssr: false
});
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });



interface Coordinates {
    lat: number;
    lng: number;
}
enum VehicleType {
    LIGHT = "light",
    MEDIUM = "medium",
    HEAVY = "heavy",
}

enum GoodType {
    PERISHABLE = "perishable",
    NON_PERISHABLE = "non-perishable",
}

export default function UserDashboard() {
    const router = useRouter();
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
    const[username,setUsername] = useState("");
    const[usersid,setUsersid] = useState("");
    const [estimatedCost, setEstimatedCost] = useState(0); 
    const [userAmount, setUserAmount] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
    const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);
    const [distance, setDistance] = useState(0);
    const [graphhopperResponse, setGraphhopperResponse] = useState(null); 

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };
        
    useEffect(()=>{
        const fetchData = async () => {
            const token = await getAuth();
            const data = parseJwt(token);
            setUsername(data.userName);
            setUsersid(data.userId);
            // console.log(data); 
            // console.log("Current token:", token);
        };
        fetchData();
    },[])

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
        // console.log(data);
        setGraphhopperResponse(data);  
        const points = data.paths[0].points.coordinates.map((point: [number, number]) => [point[1], point[0]]);
        setRoute(points);
        const distanceInMeters = data.paths[0].distance;
        // console.log(1,distanceInMeters);
        const distanceInKilometers = distanceInMeters / 1000; 
        // console.log(2,distanceInKilometers);
        setDistance(distanceInKilometers); 

        const cost = calculateEstimatedCost(distanceInKilometers);
        setEstimatedCost(cost);

        setLoading(false);
    };
    const vehicleCostMultiplier: Record<VehicleType, number> = {
        [VehicleType.LIGHT]: 12,
        [VehicleType.MEDIUM]: 15,
        [VehicleType.HEAVY]: 20,
    };
    const goodTypeMultiplier: Record<GoodType, number> = {
        [GoodType.PERISHABLE]: 2,
        [GoodType.NON_PERISHABLE]: 1,
    };
    const calculateEstimatedCost = (distanceInKilometers: number):number => {
        const baseCostPerKg = 10; 

        const weightCost:number = weight ? baseCostPerKg * Number(weight) : 0; 
        const vehicleCost:number = vehicleType ? weightCost * vehicleCostMultiplier[vehicleType as VehicleType] : 0; 
        const goodTypeCost:number = goodType ? vehicleCost * goodTypeMultiplier[goodType as GoodType] : 0; 
        const distanceCost:number = distanceInKilometers * 10; 
        // console.log("goodType",goodType);
        // console.log("weight",weightCost,"vehicle",vehicleCost,"good",goodTypeCost,"distance",distanceCost);
        // console.log(weightCost+vehicleCost+goodTypeCost+distanceCost);
        return Number((weightCost + vehicleCost + goodTypeCost + distanceCost).toFixed(2));
    };

    useEffect(() => {
        if (pickupCoordinates && dropoffCoordinates && goodType && vehicleType && weight ) {
            fetchRoute();
        }
    }, [pickupCoordinates, dropoffCoordinates, goodType, vehicleType, weight]);


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
    
    const handleConfirmBooking = async () => {
        if (isPaymentProcessed) {
            const bookingData = {
                userId: Number(usersid),
                good_type: goodType,  
                good_weight: Number(weight),  
                vehicle_type: vehicleType,  
                pickup_location_address: pickupLocation,  
                pickup_geolocation: `${pickupCoordinates?.lat},${pickupCoordinates?.lng}`,  
                dropoff_location_address: dropoffLocation, 
                dropoff_geolocation: `${dropoffCoordinates?.lat},${dropoffCoordinates?.lng}`,  
                payment_status: estimatedCost.toString(),  
                graphhopper_response: graphhopperResponse
            };
            // console.log(bookingData);
    
            try {
                await addBooking(bookingData);  
                setIsBookingConfirmed(true);
                console.log("Booking response:", bookingData);
                router.push("/status");
            } catch (error) {
                console.error("Error confirming booking:", error);
            }
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
                                                    className={`w-full ${isPaymentProcessed ? "cursor-not-allowed" : "bg-black"} text-white ${isPaymentProcessed ? "filter" : ""}`} 
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
                                                    className={`w-full ${!isPaymentProcessed || isBookingConfirmed ? "cursor-not-allowed" : "bg-black"} text-white ${(!isPaymentProcessed || isBookingConfirmed) ? "filter" : ""}`} 
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
