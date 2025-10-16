import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OnBoardingPage from "./pages/OnBoardingPage";
import NotificationPage from "./pages/NotificationPage";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import Chats from "./pages/Chats";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import MainLayout from "./components/layouts/MainLayout";

const App = () => {
  const { authUser, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="h-screen bg-primary flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner text="Loading..." size="xl" showText={true} />
        </div>
      </div>
    );

  const isOnboarded = Boolean(authUser?.isOnboarded);

  // Protected route wrapper: require auth, and force onboarding if not completed
  const ProtectedRoute = ({ children }) => {
    if (!authUser) return <Navigate to="/login" replace />;
    if (!isOnboarded) return <Navigate to="/onboarding" replace />;
    return <MainLayout>{children}</MainLayout>;
  };

  return (
    <div className="h-screen bg-primary text-white">
      <Routes>
        {/* Auth routes without layout - redirect onboard-not-done users to /onboarding */}
        <Route
          path="/login"
          element={
            !authUser ? (
              <LoginPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !authUser ? (
              <SignUpPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} replace />
            )
          }
        />

        {/* Onboarding route - block access after completion */}
        <Route
          path="/onboarding"
          element={
            !authUser ? (
              <Navigate to="/login" replace />
            ) : isOnboarded ? (
              <Navigate to="/" replace />
            ) : (
              <OnBoardingPage />
            )
          }
        />

        {/* Protected routes with MainLayout (auto-redirect to onboarding if needed) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/call"
          element={
            <ProtectedRoute>
              <CallPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
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
