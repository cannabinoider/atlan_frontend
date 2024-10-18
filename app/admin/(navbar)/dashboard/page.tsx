"use client";
import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    IconButton,
    Modal,
    TextField,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { getVehicles, updateVehicle, addVehicle } from "@/actions/api";
import { getAuth } from "@/actions/cookie";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

interface Vehicle {
    vehicle_id: number;
    name: string;
    vehicle_type: string;
    vehicle_status:string;
}

export default function UserDashboard({ username }: { username: string }) {
    const [tabValue, setTabValue] = useState(0);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [name, setName] = useState<string>('');
    const [vehicleType, setVehicleType] = useState<string>('light');
    const [vehicleStatus, setVehicleStatus] = useState<string>('available');

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await getVehicles();
                setVehicles(data.vehicles);
            } catch (error) {
                console.error("Failed to fetch vehicles:", error);
            }
        };

        fetchVehicles();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleOpen = (vehicle?: Vehicle) => {
        if (vehicle) {
            setIsEditing(true);
            setSelectedVehicle(vehicle);
            setName(vehicle.name);
            setVehicleStatus(vehicle.vehicle_status);
            setVehicleType(vehicle.vehicle_type);
        } else {
            setIsEditing(false);
            setName('');
            setVehicleType('light');
            setVehicleStatus('available');
        }
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
        setSelectedVehicle(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      
      const token = await getAuth(); 
      console.log("Current token:", token);
  
      const body = {
          name,
          vehicle_type: vehicleType,
          token: token ?? '',
          vehicle_status: vehicleStatus,  
      };
      
      try {
          if (isEditing && selectedVehicle) {
              await updateVehicle({ ...body, vehicle_id: selectedVehicle.vehicle_id.toString() });
          } else {
              await addVehicle(body);
          }
          const data = await getVehicles();
          setVehicles(data.vehicles);
          handleClose();
      } catch (error) {
          console.error("Failed to save vehicle:", error);
      }
  };

    return (
        <Box className="mx-5 ml-[250px] mt-11 max-[1420px]:mx-10 max-lg:mx-5">
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Dashboard Tabs">
                <Tab label="Vehicles" />
                <Tab label="Booking" />
                <Tab label="Driver" />
            </Tabs>

            {tabValue === 0 && (
                <Box mt={2}>
                    <Typography variant="h4" gutterBottom>
                        Vehicle Management
                    </Typography>
                    <Button variant="contained" onClick={() => handleOpen()} startIcon={<AddIcon />}>
                        Add Vehicle
                    </Button>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Vehicle ID</TableCell>
                                <TableCell>Vehicle Type</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vehicles.map(vehicle => (
                                <TableRow key={vehicle.vehicle_id}>
                                    <TableCell>{vehicle.vehicle_id}</TableCell>
                                    <TableCell>{vehicle.vehicle_type}</TableCell>
                                    <TableCell>{vehicle.name}</TableCell>                                   
                                    <TableCell>{vehicle.vehicle_status}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpen(vehicle)}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}

            <Modal
                open={modalOpen}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="modal-title" variant="h6">
                        {isEditing ? 'Edit Vehicle' : 'Add Vehicle'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Vehicle Name"
                            variant="outlined"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            select
                            label="Vehicle Type"
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                            SelectProps={{
                                native: true,
                            }}
                            fullWidth
                            margin="normal"
                            required
                        >
                            <option value="light">Light</option>
                            <option value="medium">Medium</option>
                            <option value="heavy">Heavy</option>
                        </TextField>
                        <TextField
                            select
                            label="Vehicle Status"
                            value={vehicleStatus}
                            onChange={(e) => setVehicleStatus(e.target.value)}
                            SelectProps={{
                                native: true,
                            }}
                            fullWidth
                            margin="normal"
                            required
                        >
                            <option value="available">Available</option>
                            <option value="not-available">Not-Available</option>
                        </TextField>
                        <Button type="submit" variant="contained" color="primary">
                            {isEditing ? 'Update' : 'Add'}
                        </Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
}
