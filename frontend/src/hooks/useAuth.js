import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

export const useAuth = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (error) {
        if (error.response?.status === 401) {
          return { user: null };
        }
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60 * 10, 
    cacheTime: 1000 * 60 * 30,
  });

  return {
    authUser: data?.user ?? null,
    isLoading,
    isError,
    error,
  };
};
