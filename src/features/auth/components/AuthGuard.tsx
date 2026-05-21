"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/providers/auth-store";
import { isProtectedPath } from "@/config/routes";

type AuthGuardProps = {
  children: React.ReactNode;
};

const REDIRECT_TOAST_ID = "auth-redirect";

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const redirectedRef = useRef(false);

  const requiresAuth = isProtectedPath(pathname);

  useEffect(() => {
    if (!hydrated) return;
    if (!requiresAuth) {
      redirectedRef.current = false;
      return;
    }
    if (user) {
      redirectedRef.current = false;
      return;
    }
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    toast.warning("Anda perlu login untuk mengakses halaman ini", {
      id: REDIRECT_TOAST_ID,
    });
    const target = `/login?next=${encodeURIComponent(pathname ?? "/home")}`;
    router.replace(target);
  }, [hydrated, user, pathname, router, requiresAuth]);

  // Public routes render immediately, even before hydration.
  if (!requiresAuth) {
    return <>{children}</>;
  }

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Memuat sesi…</div>
      </div>
    );
  }

  return <>{children}</>;
}