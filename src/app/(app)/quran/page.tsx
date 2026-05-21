"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, ChevronRight, BookOpen, BookmarkIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { useSurahs } from "@/features/quran/api/use-quran";
import { LastReadCard } from "@/features/quran/components/LastReadCard";

export default function QuranPage() {
  const { data, isLoading, isError, refetch } = useSurahs();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((s) =>
      [s.name_latin, s.translation, String(s.number)].some((v) =>
        v.toLowerCase().includes(term),
      ),
    );
  }, [data, q]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Al-Qur'an"
        description="114 surah lengkap dengan terjemahan."
        actions={
          <Link
            href="/quran/bookmarks"
            aria-label="Bookmark"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/15"
          >
            <BookmarkIcon className="h-5 w-5" aria-hidden />
          </Link>
        }
      />

      <LastReadCard />

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari surah..."
          className="pl-9"
          inputMode="search"
        />
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : isError ? (
        <ErrorScreen onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Surah tidak ditemukan"
          description="Coba kata kunci lain."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((s) => (
            <li key={s.number}>
              <Link
                href={`/quran/${s.number}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent/40 active:bg-accent/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {s.number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {s.name_latin}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.translation} · {s.revelation} · {s.number_of_ayahs} ayat
                  </p>
                </div>
                <span
                  className="shrink-0 font-quran text-xl leading-none text-primary"
                  dir="rtl"
                  lang="ar"
                >
                  {s.name}
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
