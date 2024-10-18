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
import { getSelectedJob, pushLocationOfDriver, updateStatus } from "@/actions/api";

function useInterval(callback: () => void, delay: number) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      callback();
    }, delay);

    return () => clearInterval(intervalId); 
  }, [callback, delay]);
}

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
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState("Picking Good"); 
  const driverId = localStorage.getItem("driverId");
  const updatingFrequency =  1000;

  useInterval(() => {
    if (selectedJob?.booking_id) { 
      try {
        if (navigator.geolocation) {
          console.log("Updating driver position...");
          navigator.geolocation.getCurrentPosition(async (position) => {
            await pushLocationOfDriver(
              selectedJob.booking_id, 
              position.coords.latitude.toString(), 
              position.coords.longitude.toString()
            );
            console.log("Location updated");
          });
        } else {
          console.log("Geolocation is not supported by this browser.");
        }
      } catch (error) {
        console.log("Error updating location: ", error);
      }
    }
  }, updatingFrequency);

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
            
            if (job.graphhopper_response && job.graphhopper_response.paths) {
              const path = job.graphhopper_response.paths[0].points.coordinates.map(
                (coord: number[]) => [coord[1], coord[0]] as LatLngTuple
              );
              setRouteCoordinates(path);
              console.log("Route set from graphhopper_response:", path);
            }

            await updateDriverLocation(pickupCoordinates);
          }
        } catch (error) {
          console.error("Error fetching selected job:", error);
        }
      } else {
        console.error("Driver ID is missing");
      }
    };

    const updateDriverLocation = async (pickupCoordinates: LatLngTuple) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          console.log("Updating position immediately...");
          await pushLocationOfDriver(
            selectedJob?.booking_id, 
            position.coords.latitude.toString(), 
            position.coords.longitude.toString()
          );
          console.log("Location updated immediately");
        });
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    };

    fetchSelectedJob();
  }, [driverId]);

  const handleStatusUpdate = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value as string);
  };

  const handleStatusSubmit = async () => {
    console.log(`Driver status: ${status}`);
    if (selectedJob) {
      const bookingId = selectedJob.booking_id; 
      try {
        await updateStatus({ bookingId, status });
        setCurrentStatus(status); 
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
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
              <Typography style={{ marginLeft: '20px', marginBottom: '10px', fontWeight: 'bold' }}>
                Current Status: {currentStatus}
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
