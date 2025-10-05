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
  const {
    data: authData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          return { user: null };
        }
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  const authUser = authData?.user;

  return (
    <div className="h-screen bg-primary text-white">
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
        <Route
          path="/onboarding"
          element={authUser ? <OnBoardingPage /> : <Navigate to="/login" />}
        />
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
      <Toaster
        toastOptions={{
          style: {
            background: "#2a2a2a",
            color: "#fff",
            border: "1px solid #7950be",
          },
        }}
      />
    </div>
  );
};

export default App;
