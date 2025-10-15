import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

export const useAuth = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data; // Expected: { user: { ... } }
      } catch (error) {
        // If the error is 401, it means the user is not authenticated.
        // We return a null user so the app can handle it gracefully.
        if (error.response?.status === 401) {
          return { user: null };
        }
        // For other errors, let React Query handle them.
        throw error;
      }
    },
    // These options are good for auth data:
    // - It won't refetch on window focus.
    // - It won't retry on failure (a 401 is an expected state).
    // - The data is considered fresh for a long time.
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    authUser: data?.user,
    isLoading,
    isError,
    error,
  };
};
