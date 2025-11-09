import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page Content - Add padding bottom for mobile navigation */}
        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-black pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
