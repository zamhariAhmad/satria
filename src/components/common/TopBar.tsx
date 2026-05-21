"use client";

import Link from "next/link";
import { Bell, LogIn } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { useAuthStore } from "@/providers/auth-store";

export function TopBar() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className="safe-pt sticky top-0 z-30 rounded-b-3xl border-b border-emerald-700/30 text-white shadow-lg"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #14532d 0%, #166534 35%, #16a34a 75%, #22c55e 100%)",
      }}
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3 md:max-w-3xl">
        <Link href="/home" className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 font-bold text-white shadow-inner ring-1 ring-white/30"
          >
            S
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none text-white">
              {brand.name}
            </span>
            <span className="text-[10px] text-white/80">
              Pesantren Payments
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {hydrated && user ? (
            <>
              <Link
                href="/notifikasi"
                aria-label="Notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
              >
                <Bell className="h-5 w-5" aria-hidden />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-300 ring-2 ring-emerald-700" />
              </Link>
              <Link href="/profile" aria-label="Profile">
                <Avatar className="h-9 w-9 ring-2 ring-white/40">
                  <AvatarFallback className="bg-white/15 font-semibold text-white">
                    {initials ?? "S"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="rounded-full bg-white text-primary hover:bg-white/90"
            >
              <Link href="/login">
                <LogIn className="h-4 w-4" aria-hidden />
                Masuk
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
