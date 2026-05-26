"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSurah } from "@/features/quran/api/use-quran";
import { AudioPlayer } from "@/features/quran/components/AudioPlayer";
import { useQuranStore } from "@/features/quran/store/quran-store";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function SurahPage() {
  const mounted = useIsMounted();
  const { number: numStr } = useParams<{ number: string }>();
  const number = Number(numStr);
  const [ayahPage, setAyahPage] = useState(1);
  const [showTranslation, setShowTranslation] = useState(true);

  const { data, isLoading, isError, refetch } = useSurah(number, ayahPage);

  const setLastRead = useQuranStore((s) => s.setLastRead);
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);
  const bookmarks = useQuranStore((s) => s.bookmarks);

  const observedRef = useRef<HTMLUListElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  // Reset to page 1 when surah changes.
  useEffect(() => {
    setAyahPage(1);
  }, [number]);

  // Scroll to top of ayah list when page changes.
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [ayahPage]);

  // Track last-read by observing visible ayah while user scrolls.
  useEffect(() => {
    if (!data) return;
    const container = observedRef.current;
    if (!container) return;
    const items = Array.from(
      container.querySelectorAll<HTMLLIElement>("li[data-ayah]"),
    );
    if (items.length === 0) return;

    let lastIndex = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.ayah ?? "0",
            );
            if (idx > 0) lastIndex = idx;
          }
        }
      },
      { threshold: 0.4 },
    );
    items.forEach((it) => observer.observe(it));

    const persist = () => {
      if (lastIndex > 0) {
        setLastRead({
          surahNumber: data.number,
          surahName: data.name_latin,
          ayahNumber: lastIndex,
          updatedAt: new Date().toISOString(),
        });
      }
    };
    window.addEventListener("pagehide", persist);
    return () => {
      observer.disconnect();
      window.removeEventListener("pagehide", persist);
      persist();
    };
  }, [data, setLastRead]);

  // Handle deep link to a specific ayah (#ayah-12).
  useEffect(() => {
    if (!data) return;
    const hash = window.location.hash;
    if (!hash) return;
    const target = document.querySelector(hash);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [data]);

  if (!mounted || isLoading) return <LoadingScreen />;
  if (isError || !data)
    return (
      <ErrorScreen
        onRetry={() => refetch()}
        description="Surah tidak tersedia."
      />
    );

  const prevSurah = number > 1 ? number - 1 : null;
  const nextSurah = number < 114 ? number + 1 : null;
  const showBasmalah = data.number !== 1 && data.number !== 9;

  const pagination = data.pagination;
  const totalAyahPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;
  const hasPrevAyahPage = ayahPage > 1;
  const hasNextAyahPage = ayahPage < totalAyahPages;

  // Ayah range label e.g. "1–10 / 286"
  const rangeStart = pagination ? (pagination.page - 1) * pagination.limit + 1 : 1;
  const rangeEnd = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : data.ayahs.length;
  const rangeTotal = pagination?.total ?? data.ayahs.length;

  return (
    <div className="space-y-4">
      <Link
        href="/quran"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Daftar Surah
      </Link>

      <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
        <div className="p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-primary-foreground/80">
            Surah {data.number}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{data.name_latin}</h1>
          <p
            dir="rtl"
            lang="ar"
            className="mt-1 font-quran text-3xl leading-tight"
          >
            {data.name}
          </p>
          <p className="mt-2 text-sm text-primary-foreground/90">
            {data.translation}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px]">
            <span className="rounded-full bg-white/15 px-2 py-0.5">
              {data.revelation}
            </span>
            <span className="rounded-full bg-white/15 px-2 py-0.5">
              {data.number_of_ayahs} ayat
            </span>
          </div>
          {data.audio_url ? (
            <div className="mt-4 flex justify-center">
              <AudioPlayer
                src={data.audio_url}
                label="Putar Surah"
                size="md"
                variant="ghost"
                className="bg-white/15 text-white hover:bg-white/25"
              />
            </div>
          ) : null}
        </div>
      </section>

      {showBasmalah && ayahPage === 1 ? (
        <p
          dir="rtl"
          lang="ar"
          className="rounded-xl border bg-card p-4 text-center font-quran text-2xl leading-loose"
        >
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
        </p>
      ) : null}

      {/* Scroll anchor — sits just above the ayah list */}
      <div ref={topRef} className="-mt-2" />

      {/* Toolbar: ayah range + pagination + toggle terjemahan */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: range info + page nav */}
        <div className="flex items-center gap-1">
          {totalAyahPages > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevAyahPage}
                onClick={() => setAyahPage((p) => p - 1)}
                className="h-7 w-7 p-0"
                aria-label="Halaman ayat sebelumnya"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              </Button>
              <span className="text-xs text-muted-foreground">
                Ayat {rangeStart}–{rangeEnd} / {rangeTotal}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextAyahPage}
                onClick={() => setAyahPage((p) => p + 1)}
                className="h-7 w-7 p-0"
                aria-label="Halaman ayat selanjutnya"
              >
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </>
          )}
          {totalAyahPages <= 1 && (
            <span className="text-xs text-muted-foreground">
              {rangeTotal} ayat
            </span>
          )}
        </div>

        {/* Right: toggle terjemahan */}
        <button
          type="button"
          onClick={() => setShowTranslation((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40"
        >
          {showTranslation ? (
            <EyeOff className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Eye className="h-3.5 w-3.5" aria-hidden />
          )}
          {showTranslation ? "Sembunyikan" : "Tampilkan"} terjemahan
        </button>
      </div>

      <ul ref={observedRef} className="flex flex-col gap-3">
        {data.ayahs.map((a) => {
          const bookmarked = bookmarks.some(
            (b) =>
              b.surahNumber === data.number && b.ayahNumber === a.ayah_number,
          );
          return (
            <li
              key={a.id}
              id={`ayah-${a.ayah_number}`}
              data-ayah={a.ayah_number}
              className="scroll-mt-20 rounded-xl border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <Badge variant="muted">
                  {data.number}:{a.ayah_number}
                </Badge>
                <div className="flex items-center gap-1">
                  {a.audio_url ? (
                    <AudioPlayer
                      src={a.audio_url}
                      label={`Ayat ${a.ayah_number}`}
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      toggleBookmark({
                        surahNumber: data.number,
                        surahName: data.name_latin,
                        ayahNumber: a.ayah_number,
                      });
                      toast.success(
                        bookmarked
                          ? "Bookmark dihapus"
                          : `Tersimpan: ${data.name_latin} ayat ${a.ayah_number}`,
                      );
                    }}
                    aria-label={
                      bookmarked ? "Hapus bookmark" : "Simpan bookmark"
                    }
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      bookmarked
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {bookmarked ? (
                      <BookmarkCheck className="h-4 w-4" aria-hidden />
                    ) : (
                      <Bookmark className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                  <Link
                    href={`/quran/${data.number}/${a.ayah_number}`}
                    aria-label={`Detail ayat ${a.ayah_number}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
                  >
                    <Info className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
              <p
                dir="rtl"
                lang="ar"
                className="mt-3 text-right font-quran text-xl leading-[2.2]"
              >
                {a.arab}
              </p>
              {showTranslation && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {a.translation}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* Bottom navigation: surah prev | ayat pagination | surah next */}
      <nav className="flex items-center justify-between gap-2 border-t pt-4">
        {/* Surah sebelumnya */}
        {prevSurah ? (
          <Link
            href={`/quran/${prevSurah}`}
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border bg-card font-medium hover:bg-accent/40"
            aria-label="Surah Sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
        ) : (
          <span className="h-9 w-9 flex-shrink-0" />
        )}

        {/* Ayat pagination (tengah) */}
        {totalAyahPages > 1 ? (
          <div className="flex flex-1 items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrevAyahPage}
              onClick={() => setAyahPage((p) => p - 1)}
              className="flex-1"
            >
              <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
              Ayat Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextAyahPage}
              onClick={() => setAyahPage((p) => p + 1)}
              className="flex-1"
            >
              Ayat Selanjutnya
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <span className="flex-1" />
        )}

        {/* Surah selanjutnya */}
        {nextSurah ? (
          <Link
            href={`/quran/${nextSurah}`}
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border bg-card font-medium hover:bg-accent/40"
            aria-label="Surah Selanjutnya"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </Link>
        ) : (
          <span className="h-9 w-9 flex-shrink-0" />
        )}
      </nav>
    </div>
  );
}
