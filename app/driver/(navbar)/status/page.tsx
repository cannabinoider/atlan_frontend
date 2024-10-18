"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
} from "@mui/material";
import { MapContainer, TileLayer, Polyline, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { LatLngTuple, LatLngBounds } from "leaflet";
import { SelectChangeEvent } from "@mui/material";
import { getSelectedJob } from "@/actions/api";

function FitBounds({ routeCoordinates, driverCoordinates }: { routeCoordinates: LatLngTuple[], driverCoordinates: LatLngTuple }) {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      const bounds = new LatLngBounds([...routeCoordinates, driverCoordinates]); 
      map.fitBounds(bounds);
    }
  }, [map, routeCoordinates, driverCoordinates]);

  return null;
}

export default function DriverStatus() {
  const [driverCoordinates, setDriverCoordinates] = useState<LatLngTuple>([0, 0]);
  const [status, setStatus] = useState("Picking Good");
  const [routeCoordinates, setRouteCoordinates] = useState<LatLngTuple[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null); // Store the job details
  const driverId = localStorage.getItem("driverId");

  useEffect(() => {
    const fetchSelectedJob = async () => {
      if (driverId) {
        try {
          const jobData = await getSelectedJob(parseInt(driverId));
          console.log("Fetched job data:", jobData);
          if (jobData && jobData.jobs && jobData.jobs.length > 0) {
            const job = jobData.jobs[0]; 
            setSelectedJob(job);
            const pickupCoordinates: LatLngTuple = job.pickup_geolocation.split(",").map(Number) as LatLngTuple;
            const dropoffCoordinates: LatLngTuple = job.dropoff_geolocation.split(",").map(Number) as LatLngTuple;

            setDriverCoordinates(pickupCoordinates);

            await fetchRoute(pickupCoordinates, dropoffCoordinates);
          }
        } catch (error) {
          console.error("Error fetching selected job:", error);
        }
      } else {
        console.error("Driver ID is missing");
      }
    };

    fetchSelectedJob();
  }, [driverId]);

  const fetchRoute = async (pickup: LatLngTuple, dropoff: LatLngTuple) => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const start = `${pickup[0]},${pickup[1]}`;
    const end = `${dropoff[0]},${dropoff[1]}`;

    try {
      const response = await axios.get(
        `https://graphhopper.com/api/1/route?point=${start}&point=${end}&vehicle=car&locale=en&points_encoded=false&key=${apiKey}`
      );

      const path = response.data.paths[0].points.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]] as LatLngTuple
      );
      setRouteCoordinates(path);

      console.log("Route fetched successfully:", path);
    } catch (error) {
      console.error("Error fetching route from GraphHopper:", error);
    }
  };

  const handleStatusUpdate = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value as string);
  };

  const handleStatusSubmit = () => {
    console.log(`Driver status: ${status}`);
  };

  return (
    <div className="mx-5 ml-[200px] mt-11">
      <div className="py-4 mx-5 mt-4">
        <Typography variant="h4" gutterBottom>
          Current Booking
        </Typography>
        {selectedJob ? (
          <Card variant="outlined" className="mt-2">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Booking ID: {selectedJob.booking_id}
              </Typography>
              <Typography>Username: {selectedJob.user_id}</Typography>
              <Typography>Pickup: {selectedJob.pickup_location_address}</Typography>
              <Typography>Dropoff: {selectedJob.dropoff_location_address}</Typography>
              <Typography>Cost: {selectedJob.payment_status}</Typography>
              <Typography>Vehicle: {selectedJob.vehicle_type}</Typography>
            </CardContent>
          </Card>
        ) : (
          <Typography>Loading booking details...</Typography>
        )}

        <Card variant="outlined" className="mt-4">
          <CardContent>
            <div className="space-x-4 mt-4">
              <Typography variant="h6" style={{ marginLeft: '20px', marginBottom: '10px' }}>
                Update Status
              </Typography>
              <Select value={status} onChange={handleStatusUpdate} displayEmpty>
                <MenuItem value="Picking Good">Picking Good</MenuItem>
                <MenuItem value="Good Picked">Good Picked</MenuItem>
                <MenuItem value="In-Transit">In-Transit</MenuItem>
                <MenuItem value="Reached">Reached</MenuItem>
                <MenuItem value="Good Delivered">Good Delivered</MenuItem>
              </Select>
              <Button
                variant="contained"
                onClick={handleStatusSubmit}
                className="mt-3"
                style={{ backgroundColor: 'black', color: 'white' }}
              >
                Update Status
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="outlined" className="mt-4">
          <CardContent>
            <Typography variant="h6" style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px' }}>
              Route
            </Typography>
            <div className="mt-4 flex flex-col">
              {selectedJob ? (
                <MapContainer
                  center={driverCoordinates}
                  zoom={12}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {routeCoordinates.length > 0 && (
                    <Polyline positions={routeCoordinates} color="red" weight={5} />
                  )}
                  <Circle center={driverCoordinates} radius={100} color="red" fillOpacity={0.5} />
                  <FitBounds routeCoordinates={routeCoordinates} driverCoordinates={driverCoordinates} />
                </MapContainer>
              ) : (
                <Typography>Loading route...</Typography>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
