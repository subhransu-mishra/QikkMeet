import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaVideo, FaSearch, FaCog } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { Logo } from "../ui/Logo";

const Navbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { authUser } = useAuth();
  const user = authUser;

  return (
    <header className="h-16 border-b border-white/10 bg-black px-4 sm:px-6 flex items-center justify-between">
      {/* Left - Logo for mobile */}
      <div className="lg:hidden flex items-center">
        <Link to="/" className="flex items-center">
          <Logo className="h-6 sm:h-7 text-white" />
        </Link>
      </div>

      {/* Center - Search Bar */}
      <div className="hidden md:flex items-center bg-black rounded-full px-3 py-1.5 flex-1 max-w-xl mx-4 lg:mx-10 border border-white/10">
        <FaSearch className="text-white/50 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent border-none outline-none w-full text-white placeholder-white/40 text-sm"
        />
      </div>

      {/* Right side - User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors">
          <FaCog className="text-base sm:text-lg" />
        </button>

        <div className="relative">
          <button
            className="flex items-center space-x-2 sm:space-x-3"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="flex flex-col items-end">
              <span className="text-xs sm:text-sm font-medium hidden md:block truncate max-w-[120px]">
                {user?.fullName || "User"}
              </span>
            </div>
            <div className="relative group">
              <img
                src={
                  user?.profilePic ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                }
                alt="User Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white"
              />
              <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black px-3 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10 shadow-lg pointer-events-none z-50">
                {user?.fullName || "User"}
              </span>
            </div>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-52 bg-black rounded-lg shadow-lg py-2 z-50 border border-white/10">
              <Link
                to="/profile"
                className="flex items-center space-x-3 px-4 py-2 hover:bg-white/10 transition-colors"
              >
                <img
                  src={
                    user?.profilePic ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                  }
                  alt="User Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium">My Profile</span>
              </Link>

              <div className="border-t border-white/10 my-1"></div>

              <Link
                to="/settings"
                className="flex items-center space-x-3 px-4 py-2 hover:bg-white/10 transition-colors"
              >
                <FaCog className="text-white/50" />
                <span className="text-sm">Settings</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
