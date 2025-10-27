import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
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

createRoot(document.getElementById("root")).render(
  <RootWrapper>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </RootWrapper>
);
