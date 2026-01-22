import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending } = useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Login successful!");
      // Persist token first so subsequent requests are authorized
      localStorage.setItem("token", data.token);
      // Clear any cached data from a previous session
      queryClient.clear();
      // Seed auth cache for immediate UI update
      queryClient.setQueryData(["authUser"], { user: data.user });
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
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8 text-white overflow-hidden">
      {/* Animated Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(60,60,60,0.1),transparent_40%)]" />
      </div>

      {/* Backdrop Blur Layer */}
      <div className="absolute inset-0 backdrop-blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col lg:flex-row items-center justify-center gap-8"
        >
          {/* Left Side - Login Form */}
          <div className="w-full lg:w-1/2 max-w-md">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-xl mb-4 backdrop-blur-sm">
                  <img src="/logo2.png" alt="Logo" className="w-full" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
                  Sign in
                </h2>
                <p className="text-gray-400 text-sm">
                  End to end encrypted video calls and chats
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/10 transition-all duration-300 outline-none text-white placeholder-gray-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
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
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/10 transition-all duration-300 outline-none text-white placeholder-gray-500"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm cursor-pointer text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className={`w-full py-3.5 px-8 rounded-xl font-semibold transition-all duration-300 
                    ${
                      isPending
                        ? "bg-white/20 text-white/60 cursor-not-allowed"
                        : "bg-white text-black hover:bg-white/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/20 cursor-pointer"
                    }
                    shadow-lg flex items-center justify-center gap-2`}
                >
                  {isPending ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    "Get Started"
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-white cursor-pointer hover:underline font-medium transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Divider - Vertical on desktop, horizontal on mobile */}
          <div className="hidden lg:block w-px h-96 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
          <div className="lg:hidden w-full flex items-center my-6">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-6 text-gray-400 text-sm font-medium">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Right Side - Social Login Section */}
          <div className="w-full lg:w-1/2 max-w-md">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-10">
              <div className="space-y-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 cursor-pointer group"
                >
                  <FcGoogle className="w-6 h-6" />
                  <span className="text-white font-medium group-hover:text-white/90">
                    Continue with Google
                  </span>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 cursor-pointer group"
                >
                  <FaFacebook className="w-6 h-6 text-[#1877F2]" />
                  <span className="text-white font-medium group-hover:text-white/90">
                    Continue with Facebook
                  </span>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 cursor-pointer group"
                >
                  <FaApple className="w-6 h-6 text-white" />
                  <span className="text-white font-medium group-hover:text-white/90">
                    Continue with Apple
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
