import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OnBoardingPage from "./pages/OnBoardingPage";
import NotificationPage from "./pages/NotificationPage";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";
const App = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const {
    data: authData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/auth/me");
        return response.data;
      } catch (error) {
        if (error.response?.status === 401) {
          return { user: null };
        }
        throw error;
      }
    },
    retry: false, //auth check only once
    refetchOnWindowFocus: false,
    onSettled: () => {
      setAuthChecked(true);
    },
  });

  // Show loading state only on initial auth check
  if (isLoading && !authChecked) return <div>Loading...</div>;

  const authUser = authData?.user;
  return (
    <div className="h-screen">
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route path="/onboarding" element={<OnBoardingPage />} />
        <Route
          path="/notifications"
          element={!authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/call"
          element={!authUser ? <CallPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={!authUser ? <ChatPage /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
