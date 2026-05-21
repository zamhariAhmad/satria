"use client";

import type { ReactNode } from "react";
import { TopBar } from "@/components/common/TopBar";
import { BottomNav } from "@/components/common/BottomNav";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-dvh bg-background">
        <TopBar />
        <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4 md:max-w-3xl md:pb-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
