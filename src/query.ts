import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10000,
        refetchOnWindowFocus: false,
        retry: (count, error) =>
          count < 1 && error instanceof ApiError && error.status >= 500,
        retryDelay: 300,
      },
      mutations: { retry: false },
    },
  });
}
