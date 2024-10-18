import React from 'react';
import Navbar from './dashboard/Navbar'; 

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <Navbar />
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
};

export default Layout;
