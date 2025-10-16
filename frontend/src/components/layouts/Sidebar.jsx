import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCompass,
  FaEnvelope,
  FaBell,
  FaSignOutAlt,
  FaVideo,
} from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sidebarItems = [
    { icon: FaCompass, label: "Explore", path: "/" },
    { icon: FaEnvelope, label: "Chats", path: "/chat" },
    { icon: FaBell, label: "Notifications", path: "/notifications" },
    { icon: FaVideo, label: "Video Call", path: "/call" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["authUser"], { user: null });
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="w-20 lg:w-64 bg-dark-card h-full flex flex-col shadow-lg z-10 transition-all duration-300">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center lg:justify-start px-4 border-b border-gray-800">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <FaVideo className="text-white text-xl" />
          </div>
          <span className="text-xl font-bold text-white hidden lg:block">
            QikMeet
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-6">
        <ul className="space-y-3 px-3">
          {sidebarItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`group flex items-center gap-4 w-full
                   px-3 lg:px-5 py-3 rounded-full font-medium text-sm tracking-wide
                   transition-all duration-200
                   ${
                     active
                       ? "bg-secondary text-white shadow-lg shadow-secondary/40"
                       : "text-gray-400 hover:text-white hover:bg-secondary/20"
                   }`}
                >
                  <item.icon
                    className={`text-xl transition-colors ${
                      active ? "text-white" : "group-hover:text-secondary"
                    }`}
                  />
                  <span className="hidden lg:block">{item.label}</span>
                  {active && (
                    <span className="ml-auto hidden lg:inline-flex h-2 w-2 rounded-full bg-white/90 shadow" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout Button */}
      <div className="p-4 mt-auto border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 justify-center lg:justify-start px-5 py-3 rounded-full text-gray-300 hover:text-white
          transition-all duration-200 bg-secondary/10 hover:bg-secondary/20 font-medium text-sm"
        >
          <FaSignOutAlt className="text-lg group-hover:text-red-400" />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
