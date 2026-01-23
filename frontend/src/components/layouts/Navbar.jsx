import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaVideo, FaSearch, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Logo } from "../ui/Logo";
import ConfirmationModal from "../ui/ConfirmationModal";
import { disconnectStreamUser } from "../../lib/streamChat";

const Navbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const menuRef = useRef(null);
  const user = authUser;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowUserMenu(false);
  };

  const confirmLogout = async () => {
    localStorage.removeItem("token");
    try {
      await disconnectStreamUser();
    } catch {}
    await queryClient.cancelQueries();
    queryClient.clear();
    toast.success("Logged out successfully");
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-white/10 bg-black px-4 sm:px-6 flex items-center justify-between">
      <div className="lg:hidden flex items-center">
        <Link to="/" className="flex items-center">
          <Logo className="h-6 sm:h-7 text-white" />
        </Link>
      </div>

      <div className="hidden md:flex items-center bg-black rounded-full px-3 py-1.5 flex-1 max-w-xl mx-4 lg:mx-10 border border-white/10">
        <FaSearch className="text-white/50 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent border-none outline-none w-full text-white placeholder-white/40 text-sm"
        />
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* <button className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors">
          <FaCog className="text-base sm:text-lg" />
        </button> */}

        <div className="relative" ref={menuRef}>
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
                className="w-8 h-8 cursor-pointer sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white"
              />
              <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black px-3 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10 shadow-lg pointer-events-none z-50 hidden md:block">
                {user?.fullName || "User"}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-52 bg-[#0a0a0a] rounded-xl shadow-2xl py-2 z-50 border border-white/10">
              <div className="hidden md:block">
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center cursor-pointer space-x-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-white"
                >
                  <img
                    src={
                      user?.profilePic ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                    }
                    alt="User Profile"
                    className="w-8 h-8 rounded-full cursor-pointer object-cover"
                  />
                  <span className="text-sm font-medium">My Profile</span>
                </Link>

                <div className="border-t border-white/10 my-1"></div>

                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-white"
                >
                  <FaCog className="text-white/50" />
                  <span className="text-sm">Settings</span>
                </Link>

                <div className="border-t border-white/10 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full cursor-pointer flex items-center space-x-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-red-400 hover:text-red-300"
                >
                  <FaSignOutAlt className="text-base" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>

              <div className="md:hidden">
                <button
                  onClick={handleLogout}
                  className="w-full cursor-pointer flex items-center justify-center space-x-3 px-4 py-3.5 hover:bg-white/10 transition-colors text-white"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span className="text-sm font-semibold">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
      />
    </header>
  );
};

export default Navbar;
