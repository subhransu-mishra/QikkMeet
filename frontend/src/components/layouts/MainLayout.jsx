import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Page Content - Responsive padding for mobile bottom nav */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-black pb-24 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
