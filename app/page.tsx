"use client";
import { useState, useEffect } from "react";
import { TextField, Button, Typography, Link } from "@mui/material";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import Image from "next/image";
import truckImage from "@/public/Images/truck.jpg"; 
import { loginUser } from '../actions/api';
import { getAuth, setAuth, setSignupCookie } from "../actions/cookie";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [helperText, setHelperText] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
        const data = await loginUser({ username, password });
        await setAuth(data.token);
        localStorage.setItem('username', data.user.userName);
        localStorage.setItem('userid', data.user.userId.toString()); 
        localStorage.setItem('phone', data.user.userPhone);
        localStorage.setItem('token', data.token);

        router.push("/dashboard");
    } catch (error: any) {
        setError(true);
        setHelperText(error.message || "An unexpected error occurred."); 
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="login-page">
      
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-row px-8">
        <Image className="mb-2" src={truckImage} alt="Moving Truck" width={100} height={100} />        
       <h1 className="text-5xl font-bold mb-6">GoodPort</h1>
        </div>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        <form
          onSubmit={handleLogin}
          className="flex flex-col items-center"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <TextField
            required
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            error={error}
            helperText={error ? helperText : ""}
            sx={{
              '.MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'black' }, 
                '&:hover fieldset': { borderColor: 'black' }, 
                '&.Mui-focused fieldset': { borderColor: 'black' },
              },'& .MuiInputLabel-root': {
                  color: 'black', 
                  '&.Mui-focused': { color: 'black' }, 
                  }
            }}
          />
          <TextField
            required
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            error={error}
            helperText={error ? helperText : ""}
            sx={{
              '.MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'black' }, 
                '&:hover fieldset': { borderColor: 'black' }, 
                '&.Mui-focused fieldset': { borderColor: 'black' },
              },'& .MuiInputLabel-root': {
                  color: 'black', 
                  '&.Mui-focused': { color: 'black' }, 
                  }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            style={{ marginTop: "20px", backgroundColor: "black", color: "white" }} 
            disabled={loading}
          >
            {loading ? "Logging In..." : "Sign In"}
          </Button>
        </form>

        <Typography variant="body2" style={{ marginTop: "20px" }}>
          <Link className="text-black" href="/driver" underline="hover">
            Driver Login
          </Link>{" "}
          |{" "}
          <Link className="text-black" href="/admin" underline="hover">
            Admin Login
          </Link>
        </Typography>

        <Typography variant="body2" style={{ marginTop: "10px" }}>
          Don't have an account?{" "}
          <Link className="text-black" href="/signup" underline="hover">
            Create one here
          </Link>
        </Typography>
      </div>
    </div>
  );
}
