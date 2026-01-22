import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaCheck,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const SignUpPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const { mutate: signup, isLoading } = useMutation({
    mutationFn: async ({ fullName, email, password }) => {
      const response = await axiosInstance.post("/auth/signup", {
        fullName,
        email,
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Account created successfully!");
      localStorage.setItem("token", data.token);

      // Update the auth query cache with the new user data
      queryClient.setQueryData(["authUser"], { user: data.user });

      // Navigate to onboarding
      navigate("/onboarding");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      toast.error(errorMessage);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!agreeTerms) {
      setTermsError(true);
      toast.error("Please agree to the terms and conditions.");
      return;
    }
    setTermsError(false);
    signup({
      fullName: signupData.fullName,
      email: signupData.email,
      password: signupData.password,
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
          {/* Left Side - Signup Form */}
          <div className="w-full lg:w-1/2 max-w-md">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-xl mb-4 backdrop-blur-sm">
                  <img src="/logo2.png" alt="Logo" className="w-full" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
                  Create Account
                </h2>
                <p className="text-gray-400 text-sm">Just few steps away</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={signupData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/10 transition-all duration-300 outline-none text-white placeholder-gray-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/10 transition-all duration-300 outline-none text-white placeholder-gray-500"
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
                      value={signupData.password}
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

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/10 transition-all duration-300 outline-none text-white placeholder-gray-500"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <label
                    htmlFor="agreeTerms"
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <input
                      id="agreeTerms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        setTermsError(false);
                      }}
                      className="sr-only"
                    />
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all duration-200
                        ${
                          agreeTerms
                            ? "bg-white border-white"
                            : "border-white/30"
                        }
                        ${
                          termsError && !agreeTerms
                            ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black/40"
                            : ""
                        }`}
                    >
                      <FaCheck
                        className={`text-black text-xs transition-opacity duration-200 ${
                          agreeTerms ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </span>
                    <span className="text-xs text-gray-400">
                      I agree to all{" "}
                      <span className="text-white hover:underline cursor-pointer">
                        terms & conditions
                      </span>
                    </span>
                  </label>
                  {termsError && !agreeTerms && (
                    <p className="text-xs text-red-400 ml-8">
                      You must accept the terms to continue.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 px-8 rounded-xl font-semibold transition-all duration-300 
                    ${
                      isLoading
                        ? "bg-white/20 text-white/60 cursor-not-allowed"
                        : "bg-white text-black hover:bg-white/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/20 cursor-pointer"
                    }
                    shadow-lg flex items-center justify-center gap-2`}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-white cursor-pointer hover:underline font-medium transition-colors duration-200"
                  >
                    Sign in
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
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">
                Sign up with
              </h3>
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

export default SignUpPage;
