"use client";

import { TextField, Button, CircularProgress, Backdrop, Typography, Link } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupDriver } from '@/actions/api';
import { setAuth } from '@/actions/cookie'; 

export default function Signup() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!emailRegex.test(email)) {
      setError("Invalid email format.");
      setLoading(false);
      return;
    }

    if (!phoneRegex.test(phone)) {
      setError("Phone number must be exactly 10 digits.");
      setLoading(false);
      return;
    }

    try {
      const data = await signupDriver({ username, password, email, phone }); 
      await setAuth(data.token.token); 
      router.push("/driver"); 
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <form
        onSubmit={handleSignup}
        className="flex flex-col items-center"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h2 className="text-2xl font-semibold mb-4">Create an Account</h2>

        <TextField
          required
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
          sx={{
            '.MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'black' }, 
              '&:hover fieldset': { borderColor: 'black' }, 
              '&.Mui-focused fieldset': { borderColor: 'black' },
            },
            '& .MuiInputLabel-root': {
              color: 'black', 
              '&.Mui-focused': { color: 'black' }, 
            }
          }}
        />

        <TextField
          required
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          sx={{
            '.MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'black' }, 
              '&:hover fieldset': { borderColor: 'black' }, 
              '&.Mui-focused fieldset': { borderColor: 'black' },
            },
            '& .MuiInputLabel-root': {
              color: 'black', 
              '&.Mui-focused': { color: 'black' }, 
            }
          }}
        />

        <TextField
          required
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          margin="normal"
          sx={{
            '.MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'black' }, 
              '&:hover fieldset': { borderColor: 'black' }, 
              '&.Mui-focused fieldset': { borderColor: 'black' },
            },
            '& .MuiInputLabel-root': {
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
          sx={{
            '.MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'black' }, 
              '&:hover fieldset': { borderColor: 'black' }, 
              '&.Mui-focused fieldset': { borderColor: 'black' },
            },
            '& .MuiInputLabel-root': {
              color: 'black', 
              '&.Mui-focused': { color: 'black' }, 
            }
          }}
        />

        {error && <p className="text-red-500">{error}</p>}

        <Button
          variant="contained"
          type="submit"
          className="mt-4"
          fullWidth
          style={{ marginTop: "20px", backgroundColor: "black", color: "white" }}
        >
          Sign Up
        </Button>
      </form>

      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Typography variant="body2" style={{ marginTop: "10px" }}>
        Do you already have an account? <Link className="text-black" href="/driver" underline="hover">Login here</Link>
      </Typography>
    </div>
  );
}
