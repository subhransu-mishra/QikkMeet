import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false, staleTime: 300000 },
  },
});

const RootWrapper = ({ children }) => {
  if (import.meta.env.DEV) {
    return <StrictMode>{children}</StrictMode>;
  }
  return children;
};

// Choose router based on env: HashRouter in production to avoid server 404s
const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")).render(
  <RootWrapper>
    <Router>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Router>
  </RootWrapper>
);
