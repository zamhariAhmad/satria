"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpenText,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useHaditsDetail,
  useKitabHadits,
  useSearchHadits,
} from "@/features/hadits/api/use-hadits";
import type { Hadits } from "@/features/hadits/schemas/hadits";
import { prettifyKitabSlug, cleanHaditsText } from "@/features/hadits/lib/format";
import { useIsMounted } from "@/lib/use-is-mounted";

const PAGE_SIZE = 10;

export default function HaditsKitabPage() {
  // useSearchParams butuh Suspense boundary saat prerender (Next 15).
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HaditsKitabRouter />
    </Suspense>
  );
}

function HaditsKitabRouter() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const nParam = searchParams.get("n");
  const nomor = nParam ? Number(nParam) : null;
  const hasDetail = !!(nomor && Number.isFinite(nomor) && nomor > 0);

  if (hasDetail) {
    return <HaditsDetailView slug={slug} nomor={nomor as number} />;
  }
  return <HaditsListView slug={slug} />;
}

/* -------------------------------------------------------------------------- */
/* Detail view (?n=...)                                                       */
/* -------------------------------------------------------------------------- */

function HaditsDetailView({ slug, nomor }: { slug: string; nomor: number }) {
  const mounted = useIsMounted();
  const { data, isLoading, isError, refetch } = useHaditsDetail(slug, nomor);
  // Pull just one row to learn the kitab name + total.
  const meta = useKitabHadits({ slug, page: 1, limit: 1 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug, nomor]);

  if (!mounted || isLoading) return <LoadingScreen />;
  if (isError || !data)
    return (
      <ErrorScreen
        onRetry={() => refetch()}
        description="Hadits tidak tersedia."
      />
    );

  const kitabName = meta.data?.nama ?? prettifyKitabSlug(slug);
  const total = meta.data?.total;
  const prev = nomor > 1 ? nomor - 1 : null;
  const next = total && nomor >= total ? null : nomor + 1;

  return (
    <div className="space-y-4">
      <Link
        href={`/hadits/${slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {kitabName}
      </Link>

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <Badge
              variant="muted"
              className="bg-white/20 text-white hover:bg-white/25"
            >
              {kitabName} · No. {data.nomor}
            </Badge>
          </div>

          <p
            dir="rtl"
            lang="ar"
            className="mt-5 whitespace-pre-line text-right font-quran text-xl leading-[2.1]"
          >
            {cleanHaditsText(data.arab)}
          </p>
        </CardContent>
        <Separator className="bg-white/20" />
        <CardContent className="p-5">
          <p className="text-[10px] uppercase tracking-wide text-primary-foreground/80">
            Terjemahan
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-primary-foreground/95">
            {cleanHaditsText(data.terjemah) || "(Terjemahan belum tersedia.)"}
          </p>
        </CardContent>
      </Card>

      <nav
        aria-label="Navigasi hadits"
        className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3"
      >
        {prev ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/hadits/${slug}?n=${prev}`}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              No. {prev}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        <p className="text-xs text-muted-foreground">
          {total ? (
            <>
              <strong className="text-foreground">{nomor}</strong> /{" "}
              {total.toLocaleString("id-ID")}
            </>
          ) : (
            <>Hadits #{nomor}</>
          )}
        </p>
        {next ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/hadits/${slug}?n=${next}`}>
              No. {next}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* List view (default)                                                        */
/* -------------------------------------------------------------------------- */

function HaditsListView({ slug }: { slug: string }) {
  const mounted = useIsMounted();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPage, setSearchPage] = useState(1);

  // Reset paging when slug changes.
  useEffect(() => {
    setPage(1);
    setSearchInput("");
    setSearchTerm("");
    setSearchPage(1);
  }, [slug]);

  const isSearching = searchTerm.trim().length >= 2;

  const list = useKitabHadits({ slug, page, limit: PAGE_SIZE });
  const search = useSearchHadits({
    q: searchTerm,
    kitab: slug,
    page: searchPage,
    limit: PAGE_SIZE,
    enabled: isSearching,
  });

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPage(1);
    setSearchTerm(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setSearchPage(1);
  };

  return (
    <div className="space-y-4">
      <Link
        href="/hadits"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Daftar Kitab
      </Link>

      <PageHeader
        title={mounted ? (list.data?.nama ?? prettifyKitabSlug(slug)) : prettifyKitabSlug(slug)}
        description={
          mounted && list.data
            ? `${list.data.total.toLocaleString("id-ID")} hadits dalam kitab ini.`
            : "Memuat informasi kitab..."
        }
      />

      {/* Search box */}
      <form onSubmit={onSubmitSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari hadits di kitab ini..."
            className="pl-9"
            inputMode="search"
          />
        </div>
        <Button type="submit" disabled={searchInput.trim().length < 2}>
          Cari
        </Button>
      </form>
      {isSearching ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Hasil pencarian: <strong className="text-foreground">{searchTerm}</strong>
          </span>
          <button
            type="button"
            onClick={clearSearch}
            className="font-medium text-primary hover:underline"
          >
            Bersihkan
          </button>
        </div>
      ) : null}

      {isSearching ? (
        <SearchResults
          slug={slug}
          isLoading={!mounted || search.isLoading}
          isError={search.isError}
          onRetry={() => search.refetch()}
          items={search.data?.results ?? []}
          page={search.data?.page ?? searchPage}
          totalPages={search.data?.total_pages ?? 1}
          total={search.data?.total ?? 0}
          onPage={setSearchPage}
        />
      ) : (
        <BrowseList
          slug={slug}
          isLoading={!mounted || list.isLoading}
          isError={list.isError}
          onRetry={() => list.refetch()}
          items={list.data?.hadiths ?? []}
          page={list.data?.page ?? page}
          totalPages={list.data?.total_pages ?? 1}
          total={list.data?.total ?? 0}
          onPage={setPage}
        />
      )}
    </div>
  );
}

type SectionProps = {
  slug: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  items: Hadits[];
  page: number;
  totalPages: number;
  total: number;
  onPage: (n: number) => void;
};

function BrowseList(props: SectionProps) {
  return (
    <Section
      {...props}
      emptyTitle="Belum ada hadits"
      emptyDescription="Daftar hadits untuk kitab ini belum tersedia."
    />
  );
}

function SearchResults(props: SectionProps) {
  return (
    <Section
      {...props}
      emptyTitle="Tidak ada hasil"
      emptyDescription="Coba kata kunci lain atau kurangi spesifik."
    />
  );
}

function Section({
  slug,
  isLoading,
  isError,
  onRetry,
  items,
  page,
  totalPages,
  total,
  onPage,
  emptyTitle,
  emptyDescription,
}: SectionProps & {
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorScreen onRetry={onRetry} />;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={BookOpenText}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }
  const safeTotalPages = Math.max(1, totalPages);
  return (
    <div className="space-y-3">
      <ul className="flex flex-col gap-2">
        {items.map((h) => (
          <li key={`${h.kitab}-${h.nomor}`}>
            <Link
              href={`/hadits/${slug}?n=${h.nomor}`}
              className="block rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40 active:bg-accent/60"
            >
              <div className="flex items-center justify-between">
                <Badge variant="muted">
                  {prettifyKitabSlug(h.kitab)} · #{h.nomor}
                </Badge>
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <p
                dir="rtl"
                lang="ar"
                className="mt-3 line-clamp-2 text-right font-quran text-lg leading-loose"
              >
                {cleanHaditsText(h.arab)}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {cleanHaditsText(h.terjemah)}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination
        page={page}
        totalPages={safeTotalPages}
        total={total}
        onChange={onPage}
      />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (n: number) => void;
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canPrev}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Sebelumnya
      </Button>
      <p className="text-xs text-muted-foreground">
        Halaman <strong className="text-foreground">{page}</strong> /{" "}
        {totalPages}
        <span className="ml-2">({total.toLocaleString("id-ID")} total)</span>
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canNext}
        onClick={() => onChange(page + 1)}
      >
        Selanjutnya
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Button>
    </nav>
  );
}
