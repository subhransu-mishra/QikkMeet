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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { SkewLoader } from "react-spinners";
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
                Create Account
              </h2>
              <p className="text-gray-400">Join us for an amazing experience</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full pl-10 pr-4 py-3 bg-primary border border-gray-700 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 outline-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

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
                    value={signupData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-primary border border-gray-700 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 outline-none"
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
                    className="w-full pl-10 pr-12 py-3 bg-primary border border-gray-700 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 outline-none"
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
                    className="w-full pl-10 pr-12 py-3 bg-primary border border-gray-700 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 outline-none"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors duration-200"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions (FIXED double toggle issue) */}
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
                    className={`flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-200
                      ${
                        agreeTerms
                          ? "bg-secondary border-secondary"
                          : "border-gray-600"
                      }
                      ${
                        termsError && !agreeTerms
                          ? "ring-2 ring-red-500 ring-offset-2 ring-offset-primary"
                          : ""
                      }`}
                  >
                    <FaCheck
                      className={`text-white text-sm transition-opacity duration-200 ${
                        agreeTerms ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </span>
                  <span className="text-sm text-gray-400">
                    I agree to all{" "}
                    <span className="text-secondary hover:underline">
                      terms & conditions
                    </span>
                  </span>
                </label>
                {termsError && !agreeTerms && (
                  <p className="text-xs text-red-400">
                    You must accept the terms to continue.
                  </p>
                )}
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
                    <span className="text-white">Creating Account...</span>
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-secondary hover:underline font-semibold transition-colors duration-200"
                >
                  Sign In
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
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Video Chat Illustration"
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

export default SignUpPage;
