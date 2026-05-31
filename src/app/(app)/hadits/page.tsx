"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpenText, Search, ChevronRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useDailyHadits,
  useKitabList,
} from "@/features/hadits/api/use-hadits";
import { prettifyKitabSlug, cleanHaditsText } from "@/features/hadits/lib/format";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function HaditsPage() {
  const mounted = useIsMounted();
  const { data, isLoading, isError, refetch } = useKitabList();
  const daily = useDailyHadits();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    if (!term) return data.kitab;
    return data.kitab.filter((k) =>
      [k.nama, k.slug].some((v) => v.toLowerCase().includes(term)),
    );
  }, [data, q]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hadits"
        description="Telusuri kitab-kitab hadits terkenal."
      />

      {/* Daily hadits */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
        <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
          <div>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Sparkles className="h-4 w-4" aria-hidden />
              Hadits Pilihan Hari Ini
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Diperbarui setiap hari.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {!mounted || daily.isLoading ? (
            <p className="text-xs text-primary-foreground/80">Memuat…</p>
          ) : daily.isError || !daily.data ? (
            <p className="text-xs text-primary-foreground/80">
              Gagal memuat hadits harian.
            </p>
          ) : (
            <Link
              href={`/hadits/${daily.data.kitab}?n=${daily.data.nomor}`}
              className="block rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/15"
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant="muted"
                  className="bg-white/20 text-white hover:bg-white/25"
                >
                  {prettifyKitabSlug(daily.data.kitab)} · #{daily.data.nomor}
                </Badge>
                <ChevronRight className="h-4 w-4" aria-hidden />
              </div>
              <p
                dir="rtl"
                lang="ar"
                className="mt-3 line-clamp-3 text-right font-quran text-base leading-loose"
              >
                {cleanHaditsText(daily.data.arab)}
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-primary-foreground/90">
                {cleanHaditsText(daily.data.terjemah)}
              </p>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama kitab..."
          className="pl-9"
          inputMode="search"
        />
      </div>

      {/* Kitab list */}
      {!mounted || isLoading ? (
        <LoadingScreen />
      ) : isError ? (
        <ErrorScreen onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpenText}
          title="Kitab tidak ditemukan"
          description="Coba kata kunci lain."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((k) => (
            <li key={k.slug}>
              <Link
                href={`/hadits/${k.slug}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent/40 active:bg-accent/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpenText className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{k.nama}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {k.jumlah.toLocaleString("id-ID")} hadits ·{" "}
                    <span className="font-mono">{k.slug}</span>
                  </p>
                </div>
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
