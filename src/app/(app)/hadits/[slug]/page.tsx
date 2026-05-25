"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
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
import {
  useKitabHadits,
  useSearchHadits,
} from "@/features/hadits/api/use-hadits";
import type { Hadits } from "@/features/hadits/schemas/hadits";
import { prettifyKitabSlug, cleanHaditsText } from "@/features/hadits/lib/format";
import { useIsMounted } from "@/lib/use-is-mounted";

const PAGE_SIZE = 10;

type Params = Promise<{ slug: string }>;

export default function HaditsKitabPage({ params }: { params: Params }) {
  const mounted = useIsMounted();
  const { slug } = use(params);
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
              href={`/hadits/${slug}/${h.nomor}`}
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
