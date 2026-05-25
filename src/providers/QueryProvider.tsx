"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, type ReactNode } from "react";
import { createQueryClient } from "@/lib/query-client";

const PERSIST_KEY = "satria-query-cache-v1";
// Bump this whenever the cached shape might break across releases.
const BUSTER = "v1";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createQueryClient());
  const [persister] = useState(() =>
    typeof window === "undefined"
      ? null
      : createSyncStoragePersister({
          storage: window.localStorage,
          key: PERSIST_KEY,
          throttleTime: 1000,
        }),
  );

  // During SSR/SSG `window` is unavailable so we can't persist; fall back to
  // a regular provider so client components that call `useQuery` still find
  // a QueryClient in context.
  if (!persister) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24,
        buster: BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: (q) => {
            const key = q.queryKey?.[0];
            if (typeof key !== "string") return q.state.status === "success";
            // Avoid persisting volatile or large data.
            // "doa" is intentionally included so wirid pages load from cache.
            if (key === "geocode" || key === "spiritual") return false;
            return q.state.status === "success";
          },
        },
      }}
    >
      {children}
      {process.env.NODE_ENV !== "production" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </PersistQueryClientProvider>
  );
}
