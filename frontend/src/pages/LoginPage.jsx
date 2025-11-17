import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { SkewLoader } from "react-spinners";
import { motion } from "framer-motion";

const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isLoading } = useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Login successful!");
      localStorage.setItem("token", data.token);

      // Update the auth query cache with the user data
      queryClient.setQueryData(["authUser"], { user: data.user });

      // Navigate to home page
      navigate("/");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    login({
      email: loginData.email,
      password: loginData.password,
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8 text-white">
      <div className="w-full max-w-6xl flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full lg:w-1/2 xl:w-2/5"
        >
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-400">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-primary border border-gray-700 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 outline-none text-white placeholder-gray-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-primary border border-gray-700 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 outline-none text-white placeholder-gray-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors duration-200"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm cursor-pointer text-secondary hover:underline transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-8 rounded-full font-semibold transition-all duration-300 
                  ${
                    isLoading
                      ? "bg-white/20 text-white cursor-not-allowed"
                      : "bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 cursor-pointer"
                  }
                  shadow-lg`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <SkewLoader color="#ffffff" size={10} />
                    <span className="text-white">Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 flex items-center">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-secondary text-white font-medium
                hover:bg-[#6d44b5] transition-all duration-200 shadow hover:shadow-secondary/40 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-secondary text-white font-medium
                hover:bg-[#6d44b5] transition-all duration-200 shadow hover:shadow-secondary/40 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-secondary cursor-pointer hover:underline font-semibold transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side Image - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 items-center justify-center pl-8">
          <div className="relative">
            <div className="w-96 h-96 bg-gradient-to-br from-secondary to-purple-700 rounded-full animate-float opacity-20 absolute -top-10 -left-10"></div>
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
                alt="Login Illustration"
                className="w-full max-w-lg rounded-2xl shadow-2xl animate-float"
              />
            </div>
            <div
              className="w-32 h-32 bg-gradient-to-br from-secondary to-purple-700 rounded-full animate-float opacity-30 absolute -bottom-5 -right-5"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
