"use client";

import { useEffect, type ReactNode } from "react";
import { env } from "@/config/env";
import { mockReady } from "@/lib/mock-ready";

let started = false;

async function startMocks() {
  if (started) return;
  if (typeof window === "undefined") return;
  if (!env.useMock) {
    mockReady.resolve();
    return;
  }
  try {
    const { worker } = await import("@/mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
      quiet: true,
    });
    started = true;
  } finally {
    mockReady.resolve();
  }
}

export function MockProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    startMocks();
  }, []);
  return <>{children}</>;
}
