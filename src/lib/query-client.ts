import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        // Keep cached data on disk for a day so reloads feel instant.
        gcTime: 1000 * 60 * 60 * 24,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
