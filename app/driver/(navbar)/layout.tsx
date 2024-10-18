import React from 'react';
import DriverNavbar from './dashboard/Navbar';
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <DriverNavbar />
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
};

export default Layout;
