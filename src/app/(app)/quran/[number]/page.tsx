"use client";

import Link from "next/link";
import { use, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { Badge } from "@/components/ui/badge";
import { useSurah } from "@/features/quran/api/use-quran";
import { AudioPlayer } from "@/features/quran/components/AudioPlayer";
import { useQuranStore } from "@/features/quran/store/quran-store";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

type Params = Promise<{ number: string }>;

export default function SurahPage({ params }: { params: Params }) {
  const { number: numStr } = use(params);
  const number = Number(numStr);
  const { data, isLoading, isError, refetch } = useSurah(number);

  const setLastRead = useQuranStore((s) => s.setLastRead);
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);
  const bookmarks = useQuranStore((s) => s.bookmarks);

  const observedRef = useRef<HTMLUListElement | null>(null);

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

    // Persist on unmount or when leaving the page.
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

  if (isLoading) return <LoadingScreen />;
  if (isError || !data)
    return (
      <ErrorScreen
        onRetry={() => refetch()}
        description="Surah tidak tersedia."
      />
    );

  const prev = number > 1 ? number - 1 : null;
  const next = number < 114 ? number + 1 : null;
  const showBasmalah = data.number !== 1 && data.number !== 9;

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

      {showBasmalah ? (
        <p
          dir="rtl"
          lang="ar"
          className="rounded-xl border bg-card p-4 text-center font-quran text-2xl leading-loose"
        >
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
        </p>
      ) : null}

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
                className="mt-3 text-right font-quran text-3xl leading-[2.4]"
              >
                {a.arab}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {a.translation}
              </p>
            </li>
          );
        })}
      </ul>

      <nav className="flex items-center justify-between gap-3 pt-2">
        {prev ? (
          <Link
            href={`/quran/${prev}`}
            className="inline-flex items-center gap-1 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-accent/40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Sebelumnya
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/quran/${next}`}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-accent/40"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
