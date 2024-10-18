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
export async function updateStatus(body:{bookingId:string,status:string}) {
    const res = await fetch(`${process.env.BACKEND_URL}/api/drivers/status`, {
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



