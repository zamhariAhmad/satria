"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenCheck, ArrowRight } from "lucide-react";
import { useQuranStore } from "@/features/quran/store/quran-store";

export function LastReadCard() {
  const lastRead = useQuranStore((s) => s.lastRead);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (!hydrated || !lastRead) return null;

  return (
    <Link
      href={`/quran/${lastRead.surahNumber}#ayah-${lastRead.ayahNumber}`}
      className="block overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm transition-transform active:scale-[0.99]"
    >
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <BookOpenCheck className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-primary-foreground/80">
            Terakhir Dibaca
          </p>
          <p className="truncate text-base font-semibold">
            {lastRead.surahName}
          </p>
          <p className="text-xs text-primary-foreground/90">
            Ayat {lastRead.ayahNumber}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </div>
    </Link>
  );
}
