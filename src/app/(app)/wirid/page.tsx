"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import {
  BookHeart,
  ChevronRight,
  MoonStar,
  Search,
  Sparkles,
  Sun,
  SunMedium,
  Wind,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDoaKategori, useDoaSearch } from "@/features/spiritual/api/use-doa";
import { useIsMounted } from "@/lib/use-is-mounted";
import type { DoaKategori, DoaItem } from "@/features/spiritual/schemas/doa";

const KATEGORI_ICONS: Record<string, React.ElementType> = {
  "doa-harian": BookHeart,
  "dzikir-pagi": Sun,
  "dzikir-petang": SunMedium,
  "dzikir-setelah-shalat": MoonStar,
  "doa-pilihan": Sparkles,
};

const KATEGORI_COLORS: Record<string, string> = {
  "doa-harian": "from-emerald-500 to-teal-600",
  "dzikir-pagi": "from-amber-400 to-orange-500",
  "dzikir-petang": "from-orange-400 to-rose-500",
  "dzikir-setelah-shalat": "from-violet-500 to-purple-600",
  "doa-pilihan": "from-sky-500 to-blue-600",
};

function KategoriCard({ kategori }: { kategori: DoaKategori }) {
  const Icon = KATEGORI_ICONS[kategori.slug] ?? Wind;
  const gradient =
    KATEGORI_COLORS[kategori.slug] ?? "from-primary to-primary/80";
  return (
    <Link
      href={`/wirid/${kategori.slug}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-gradient-to-br p-4 shadow-md transition-transform active:scale-95"
      style={{ background: undefined }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5 text-white" aria-hidden />
        </span>
        <ChevronRight className="h-4 w-4 text-white/70 transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-semibold text-white">{kategori.nama}</p>
        {kategori.total != null && (
          <p className="mt-0.5 text-xs text-white/70">{kategori.total} doa</p>
        )}
      </div>
    </Link>
  );
}

function SearchResultItem({ item }: { item: DoaItem }) {
  return (
    <Link
      href={`/wirid/hasil/${item.id}`}
      className="flex items-start gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent/40 active:bg-accent/60"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BookHeart className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {item.judul || "Tanpa Judul"}
        </p>
        {item.terjemah && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {item.terjemah}
          </p>
        )}
        {item.sumber && (
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {item.sumber}
          </Badge>
        )}
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export default function WiridPage() {
  const mounted = useIsMounted();
  const { data: kategoriList, isLoading, isError, refetch } = useDoaKategori();
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const search = useDoaSearch(deferredQ, 20);
  const isSearching = deferredQ.trim().length >= 2;

  // Show a consistent skeleton on both server and first client render to
  // avoid hydration mismatches caused by the persist-cache restoring data
  // before React has reconciled.
  const showSkeleton = !mounted;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Wirid & Doa"
        description="Kumpulan doa harian, dzikir, dan doa pilihan."
      />

      {/* Search box */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari doa atau dzikir..."
          className="pl-9"
          inputMode="search"
        />
      </div>

      {/* Search results */}
      {showSkeleton ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Kategori</p>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        </div>
      ) : isSearching ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Hasil pencarian
          </p>
          {search.isLoading ? (
            <LoadingScreen />
          ) : search.isError ? (
            <ErrorScreen onRetry={() => search.refetch()} />
          ) : !search.data || search.data.length === 0 ? (
            <EmptyState
              icon={BookHeart}
              title="Doa tidak ditemukan"
              description="Coba kata kunci lain."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {search.data.map((item) => (
                <li key={item.id}>
                  <SearchResultItem item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        /* Kategori grid */
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Kategori</p>
          {isLoading ? (
            <LoadingScreen />
          ) : isError ? (
            <ErrorScreen onRetry={() => refetch()} />
          ) : !kategoriList || kategoriList.length === 0 ? (
            <EmptyState
              icon={BookHeart}
              title="Kategori tidak tersedia"
              description="Tidak ada kategori doa saat ini."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {kategoriList.map((kat) => (
                <KategoriCard key={kat.id} kategori={kat} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
