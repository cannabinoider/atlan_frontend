import React from 'react';
import AdminNavbar from './dashboard/Navbar'; 


const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <AdminNavbar />
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
};

export default Layout;
