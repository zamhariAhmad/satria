"use client";

import Link from "next/link";
import { use, useEffect } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  FileText,
} from "lucide-react";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAyah, useSurah } from "@/features/quran/api/use-quran";
import { AudioPlayer } from "@/features/quran/components/AudioPlayer";
import { useQuranStore } from "@/features/quran/store/quran-store";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

type Params = Promise<{ number: string; ayah: string }>;

const TAFSIR_LABEL: Record<"kemenag" | "quraish" | "jalalayn", string> = {
  kemenag: "Kemenag",
  quraish: "Quraish Shihab",
  jalalayn: "Jalalain",
};

export default function AyahDetailPage({ params }: { params: Params }) {
  const { number: numStr, ayah: ayahStr } = use(params);
  const number = Number(numStr);
  const ayahNum = Number(ayahStr);

  const { data, isLoading, isError, refetch } = useAyah(number, ayahNum);
  const { data: surah } = useSurah(number);

  const isBookmarked = useQuranStore((s) =>
    s.bookmarks.some(
      (b) => b.surahNumber === number && b.ayahNumber === ayahNum,
    ),
  );
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);
  const setLastRead = useQuranStore((s) => s.setLastRead);

  // Persist last-read whenever the ayah loads.
  useEffect(() => {
    if (!data || !surah) return;
    setLastRead({
      surahNumber: number,
      surahName: surah.name_latin,
      ayahNumber: ayahNum,
      updatedAt: new Date().toISOString(),
    });
  }, [data, surah, number, ayahNum, setLastRead]);

  if (isLoading) return <LoadingScreen />;
  if (isError || !data)
    return (
      <ErrorScreen
        onRetry={() => refetch()}
        description="Ayat tidak tersedia."
      />
    );

  const surahName = surah?.name_latin ?? `Surah ${number}`;
  const totalAyat = surah?.number_of_ayahs ?? Infinity;
  const prev = ayahNum > 1 ? ayahNum - 1 : null;
  const next = ayahNum < totalAyat ? ayahNum + 1 : null;

  const tafsirEntries = data.tafsir
    ? (
        ["kemenag", "quraish", "jalalayn"] as const
      ).filter((k) => data.tafsir?.[k]?.long || data.tafsir?.[k]?.short)
    : [];

  const meta = data.meta;

  return (
    <div className="space-y-4">
      <Link
        href={`/quran/${number}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {surahName}
      </Link>

      <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <Badge variant="muted" className="bg-white/15 text-white">
            {data.surah_number}:{data.ayah_number}
          </Badge>
          <button
            type="button"
            onClick={() => {
              toggleBookmark({
                surahNumber: number,
                surahName,
                ayahNumber: ayahNum,
              });
              toast.success(
                isBookmarked
                  ? "Bookmark dihapus"
                  : `Tersimpan: ${surahName} ayat ${ayahNum}`,
              );
            }}
            aria-label={isBookmarked ? "Hapus bookmark" : "Simpan bookmark"}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              isBookmarked
                ? "bg-white text-primary"
                : "bg-white/15 text-white hover:bg-white/25",
            )}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" aria-hidden />
            ) : (
              <Bookmark className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>

        <p
          dir="rtl"
          lang="ar"
          className="mt-5 text-right font-quran text-4xl leading-[2.4]"
        >
          {data.arab}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-primary-foreground/95">
          {data.translation}
        </p>

        {data.audio_url ? (
          <div className="mt-4 flex justify-end">
            <AudioPlayer
              src={data.audio_url}
              label="Putar Ayat"
              size="md"
              variant="ghost"
              className="bg-white/15 text-white hover:bg-white/25"
            />
          </div>
        ) : null}
      </section>

      {meta ? (
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Layers className="h-4 w-4 text-primary" aria-hidden />
            Posisi Mushaf
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            {meta.juz != null ? (
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Juz
                </dt>
                <dd className="text-base font-semibold">{meta.juz}</dd>
              </div>
            ) : null}
            {meta.page != null ? (
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Halaman
                </dt>
                <dd className="text-base font-semibold">{meta.page}</dd>
              </div>
            ) : null}
            {meta.manzil != null ? (
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Manzil
                </dt>
                <dd className="text-base font-semibold">{meta.manzil}</dd>
              </div>
            ) : null}
            {meta.ruku != null ? (
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Ruku
                </dt>
                <dd className="text-base font-semibold">{meta.ruku}</dd>
              </div>
            ) : null}
            {meta.hizb_quarter != null ? (
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Hizb 1/4
                </dt>
                <dd className="text-base font-semibold">{meta.hizb_quarter}</dd>
              </div>
            ) : null}
            {meta.sajda &&
            (meta.sajda.recommended || meta.sajda.obligatory) ? (
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Sajdah
                </dt>
                <dd className="text-base font-semibold">
                  {meta.sajda.obligatory ? "Wajib" : "Sunnah"}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      {tafsirEntries.length > 0 ? (
        <section className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden />
            Tafsir
          </div>
          <Tabs defaultValue={tafsirEntries[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {tafsirEntries.map((k) => (
                <TabsTrigger key={k} value={k}>
                  {TAFSIR_LABEL[k]}
                </TabsTrigger>
              ))}
            </TabsList>
            {tafsirEntries.map((k) => {
              const entry = data.tafsir?.[k];
              const long = entry?.long?.trim();
              const short = entry?.short?.trim();
              return (
                <TabsContent
                  key={k}
                  value={k}
                  className="mt-3 space-y-3 text-sm leading-relaxed"
                >
                  {short ? (
                    <p className="rounded-lg bg-primary/5 p-3 text-foreground">
                      <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        <FileText className="h-3 w-3" aria-hidden />
                        Ringkas
                      </span>
                      {short}
                    </p>
                  ) : null}
                  {long && long !== short ? (
                    <p className="whitespace-pre-line text-muted-foreground">
                      {long}
                    </p>
                  ) : null}
                </TabsContent>
              );
            })}
          </Tabs>
        </section>
      ) : null}

      <nav className="flex items-center justify-between gap-3 pt-2">
        {prev ? (
          <Link
            href={`/quran/${number}/${prev}`}
            className="inline-flex items-center gap-1 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-accent/40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Ayat {prev}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/quran/${number}/${next}`}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-accent/40"
          >
            Ayat {next}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
