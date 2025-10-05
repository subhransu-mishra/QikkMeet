import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaMapMarkerAlt, FaFileAlt, FaRandom } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const OnBoardingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [onboardingData, setOnboardingData] = useState({
    fullName: "",
    bio: "",
    location: "",
    profilePic: "",
  });

  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);

  // Generate random avatar on component mount
  useEffect(() => {
    generateRandomAvatar();
    fetchCities();
  }, []);

  const generateRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/avatars/${idx}.svg`;
    setOnboardingData((prev) => ({
      ...prev,
      profilePic: randomAvatar,
    }));
  };

  const fetchCities = async () => {
    try {
      // Using REST Countries API for cities - you can replace with your preferred API
      const popularCities = [
        "New York, USA",
        "Los Angeles, USA",
        "London, UK",
        "Paris, France",
        "Tokyo, Japan",
        "Sydney, Australia",
        "Toronto, Canada",
        "Berlin, Germany",
        "Mumbai, India",
        "Singapore",
        "Dubai, UAE",
        "Barcelona, Spain",
        "Amsterdam, Netherlands",
        "Stockholm, Sweden",
        "Bangkok, Thailand",
        "São Paulo, Brazil",
        "Mexico City, Mexico",
        "Cairo, Egypt",
        "Istanbul, Turkey",
        "Moscow, Russia",
        "Seoul, South Korea",
        "Hong Kong",
        "Zurich, Switzerland",
        "Vienna, Austria",
        "Prague, Czech Republic",
      ];
      setCities(popularCities.sort());
      setLoadingCities(false);
    } catch (error) {
      console.error("Error fetching cities:", error);
      // Fallback cities
      setCities([
        "New York, USA",
        "London, UK",
        "Paris, France",
        "Tokyo, Japan",
        "Sydney, Australia",
        "Toronto, Canada",
        "Berlin, Germany",
        "Mumbai, India",
      ]);
      setLoadingCities(false);
    }
  };

  const { mutate: onboard, isLoading } = useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post("/auth/onboarding", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Onboarding completed successfully!");

      // Update the auth query cache with the updated user data
      queryClient.setQueryData(["authUser"], { user: data.user });

      navigate("/");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Onboarding failed. Please try again.";
      toast.error(errorMessage);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOnboardingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!onboardingData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!onboardingData.bio.trim()) {
      toast.error("Please enter your bio");
      return;
    }

    if (!onboardingData.location) {
      toast.error("Please select your location");
      return;
    }

    onboard(onboardingData);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-8 text-white">
      <div className="w-full max-w-4xl">
        <div className="bg-dark-card rounded-2xl shadow-2xl shadow-secondary/20 p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-400">
              Tell us more about yourself to get started
            </p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <img
                src={onboardingData.profilePic}
                alt="Profile Avatar"
                className="w-32 h-32 rounded-full border-4 border-secondary shadow-lg"
              />
              <div className="absolute inset-0 rounded-full bg-secondary/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <FaRandom className="text-white text-xl" />
              </div>
            </div>
            <button
              type="button"
              onClick={generateRandomAvatar}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-[#6a40b4] rounded-full text-white font-medium transition-all duration-200 active:scale-95"
            >
              <FaRandom />
              Generate Random Avatar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            {/* Full Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={onboardingData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-primary border border-gray-700 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 outline-none text-white placeholder-gray-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio *
              </label>
              <div className="relative">
                <FaFileAlt className="absolute left-3 top-4 text-gray-400" />
                <textarea
                  name="bio"
                  value={onboardingData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 bg-primary border border-gray-700 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 outline-none text-white placeholder-gray-500 resize-none"
                  placeholder="Tell us about yourself..."
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {onboardingData.bio.length}/500 characters
              </p>
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <select
                  name="location"
                  value={onboardingData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-primary border border-gray-700 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300 outline-none text-white appearance-none cursor-pointer"
                  required
                  disabled={loadingCities}
                >
                  <option value="" className="bg-primary text-gray-400">
                    {loadingCities
                      ? "Loading cities..."
                      : "Select your location"}
                  </option>
                  {cities.map((city, index) => (
                    <option
                      key={index}
                      value={city}
                      className="bg-primary text-white"
                    >
                      {city}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || loadingCities}
              className={`w-full py-3 px-6 rounded-full font-semibold text-white transition-all duration-300
                ${
                  isLoading || loadingCities
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-secondary hover:bg-[#6a40b4] active:scale-95"
                }
                shadow-lg hover:shadow-secondary/40 focus:outline-none focus:ring-4 focus:ring-secondary/40`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Completing Onboarding...</span>
                </div>
              ) : (
                "Complete Onboarding"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By completing onboarding, you agree to our terms of service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnBoardingPage;
