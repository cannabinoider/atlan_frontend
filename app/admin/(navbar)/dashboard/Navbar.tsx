"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import truckImage from '@/public/Images/truck.jpg';
import Drawer from '@mui/material/Drawer';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PaymentIcon from '@mui/icons-material/Payment';
import LogoutIcon from '@mui/icons-material/Logout';
import Face6RoundedIcon from "@mui/icons-material/Face6Rounded";
import { cabIcon, roadIcon } from '@/assets/icons';
import { deleteAuth } from '@/actions/cookie';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

export default function AdminNavbar() {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  async function handleLogout() {
    await deleteAuth();
    console.log("User logged out");
    router.push('/');
  }

  const confirmLogout = async () => {
    setLogoutModalOpen(false);
    handleLogout();
  };

  const cancelLogout = () => {
    setLogoutModalOpen(false);
  };

  const toggleDrawer = (isOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event && event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setOpen(isOpen);
  };

  const options = [
    { icon: roadIcon, route: '/admin/dashboard', value: 'Dashboard', action: () => router.push('/admin/dashboard') },
    // { icon: cabIcon, route: '/admin/vehicles', value: 'Vehicles', action: () => router.push('/admin/vehicles') },
    // { icon: <Face6RoundedIcon />, route: '/admin/m', value: 'Management', action: () => router.push('/admin/management') },
    { icon: <TrackChangesIcon />, route: '/admin/analytics', value: 'Analytics', action: () => router.push('/admin/analytics') },
    { icon: <LogoutIcon />, value: 'Logout', action: handleLogoutClick }
  ];

  return (
    <div>
      <div className="hidden lg:flex fixed bg-white flex-col top-0 left-0 h-screen w-50 max-xl:w-60 border px-5 py-5">
        <div className="flex flex-col items-start my-2">
          <Image src={truckImage} alt="logo" width={80} height={80} className="mb-4" />
          <span className="text-2xl font-semibold">GoodPort</span>
        </div>
        <div className="text-sm my-2 w-full py-4">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => option.action()}
              className="flex font-medium rounded-xl cursor-pointer px-3 py-2 transition-transform transform hover:scale-105"
            >
              <div className="w-10 h-10 flex flex-col flex-shrink-0 mr-3">
                {option.icon}
              </div>
              <span className="whitespace-nowrap">{option.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hamburger-icon lg:hidden flex flex-col mt-5">
        <button
          className="relative w-10 h-10"
          onClick={toggleDrawer(true)}
          aria-label="Menu"
        >
          <div className={`absolute top-1/2 left-1/2 w-8 h-1 bg-black transition-transform duration-300 ease-in-out ${open ? 'rotate-45' : '-translate-y-2'} transform origin-center`}></div>
          <div className={`absolute top-1/2 left-1/2 w-8 h-1 bg-black transition-opacity duration-300 ease-in-out ${open ? 'opacity-0' : ''}`}></div>
          <div className={`absolute top-1/2 left-1/2 w-8 h-1 bg-black transition-transform duration-300 ease-in-out ${open ? '-rotate-45' : 'translate-y-2'} transform origin-center`}></div>
        </button>
      </div>

      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <div className="p-2">
          <div className="flex flex-col items-start my-3 font-medium text-xl">
            <Image src={truckImage} alt="logo" width={40} height={40} className="mr-2" />
            <span className="ml-3">GoodPort</span>
          </div>
          <div className="text-sm my-3 mt-10">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  option.action();
                  setOpen(false);
                }}
                className="flex items-center space-x-3 font-medium rounded-xl cursor-pointer px-3 py-2"
              >
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {option.icon}
                </div>
                <div className="whitespace-nowrap">{option.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Drawer>

      <Dialog
        open={logoutModalOpen}
        onClose={cancelLogout}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">{"Confirm Logout"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmLogout} color="primary">
            Yes, Logout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
