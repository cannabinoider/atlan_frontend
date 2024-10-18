"use server";
import { setAuth } from './cookie';

export async function loginUser(body: { username: string; password: string }) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
    }
    return await res.json(); 
}

export async function loginDriver(body: { username: string; password: string }) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/drivers/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
    }

    return await res.json();
}
export async function loginAdmin(body: { username: string; password: string }) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
    }

    return await res.json();
}
export async function signupUser(body: { username: string; password: string, email:string, phone:string}) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/users/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Signup failed');
    }

    return await res.json();
}
export async function signupDriver(body: { username: string; password: string, email:string, phone:string}) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/drivers/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Signup failed');
    }

    return await res.json();
}
export async function getVehicles() {
    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/getVehicles`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Data fetching failed');
    }

    return await res.json();
}
export async function addVehicle(body:{token:string, vehicle_type:string, name:string, vehicle_status:string}) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/insertVehicle`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Vehicle insertion failed');
    }

    return await res.json();
}
export async function updateVehicle(body:{token:string, vehicle_id:string,vehicle_type:string, name:string, vehicle_status:string}) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/updateVehicles`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Vehicle insertion failed');
    }

    return await res.json();
}

export async function getJobs() {
    const res = await fetch(`${process.env.BACKEND_URL}/api/drivers/jobs`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Data fetching failed');
    }

    return await res.json();
}
export async function acceptJobs(body:{bookingId:number,driverId:number}) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/drivers/accept-jobs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Booking failed');
    }

    return await res.json();
}

export async function getSelectedJob(driverId: number) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/drivers/selected-booking?driverId=${driverId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Data fetching failed');
    }

    return await res.json();
}
export async function updateStatus(body:{bookingId:number,status:string}) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/drivers/status`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Status Updation failed');
    }

    return await res.json();
}
export async function pushLocationOfDriver(bookingId: string, lattitude: string, longitude: string) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/drivers/current-location`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({bookingId: bookingId, latitude: lattitude, longitude: longitude}),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update location');
    }

    return await res.json();
}
export async function addBooking(body:{userId:number,good_weight:number, good_type:string, vehicle_type:string, pickup_location_address:string, pickup_geolocation:string, dropoff_geolocation:string, dropoff_location_address:string, payment_status:string, graphhopper_response:any}) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/users/booking`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        console.error("API error status:", res.status); 
        const errorText = await res.text();  
        console.error("API error response:", errorText);  
        throw new Error(errorText || 'Booking Failed');
    }

    return await res.json();
}
export async function getSelectedBooking(userId: number) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/users/booking-status?userId=${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Data fetching failed');
    }

    return await res.json();
}
export async function getBookingData() {
    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/get-all-bookings`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Data fetching failed');
    }

    return await res.json();
}
export async function getDriversData() {
    const res = await fetch(`${process.env.BACKEND_URL}/api/admin/get-driver-locations`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Data fetching failed');
    }

    return await res.json();
}



