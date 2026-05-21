"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/providers/auth-store";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hydrated) return;
    if (user) router.replace("/home");
  }, [hydrated, user, router]);

  return (
    <div
      className="safe-pt min-h-dvh"
      style={{
        backgroundImage:
          "linear-gradient(180deg, #14532d 0%, #166534 35%, #16a34a 100%)",
      }}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-10">
        <div className="mb-6 flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold text-white ring-1 ring-white/30"
          >
            S
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Satria</p>
            <p className="text-xs text-white/80">
              Monitoring pembayaran santri
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-background p-6 shadow-2xl">
          {children}
        </div>

        <p className="mt-6 text-center text-[11px] text-white/70">
          &copy; {new Date().getFullYear()} Satria. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
}