import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCompass,
  FaEnvelope,
  FaBell,
  FaSignOutAlt,
  FaVideo,
  FaHome,
} from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Logo } from "../ui/Logo";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sidebarItems = [
    { icon: FaHome, label: "Home", path: "/" },
    { icon: FaEnvelope, label: "Chats", path: "/chat" },
    { icon: FaBell, label: "Notifications", path: "/notifications" },
    { icon: FaVideo, label: "Call", path: "/call" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["authUser"], { user: null });
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
    
      <div className="hidden lg:flex w-64 bg-black h-full flex-col shadow-lg z-10 border-r border-white/10">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-4 border-b border-white/10">
          <Link to="/" className="flex items-center justify-center w-full">
            <Logo className="h-8 text-white hover:scale-105 transition-transform duration-200" />
          </Link>
        </div>

        
        <div className="flex-1 py-6">
          <ul className="space-y-3 px-3">
            {sidebarItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`group flex items-center gap-4 w-full px-5 py-3 rounded-full font-medium text-sm tracking-wide transition-all duration-200
                     ${
                       active
                         ? "bg-white text-black shadow-lg"
                         : "text-white/70 hover:text-white hover:bg-white/10"
                     }`}
                  >
                    <item.icon
                      className={`text-xl transition-colors ${
                        active ? "text-black" : "group-hover:text-white"
                      }`}
                    />
                    <span>{item.label}</span>
                    {active && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-black/80" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        
        <div className="p-4 mt-auto border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex cursor-pointer items-center gap-4 justify-start px-5 py-3 rounded-full text-black bg-white hover:bg-white/90 transition-all duration-200 font-medium text-sm"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-3">
          {sidebarItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px]
                  ${
                    active
                      ? "bg-white text-black"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
              >
                <item.icon
                  className={`text-xl transition-colors ${
                    active ? "text-black" : ""
                  }`}
                />
                <span className="text-xs font-medium">{item.label}</span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
