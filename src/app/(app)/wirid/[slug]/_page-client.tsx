"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BookHeart, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useDoaByKategori } from "@/features/spiritual/api/use-doa";
import { useIsMounted } from "@/lib/use-is-mounted";
import type { DoaItem } from "@/features/spiritual/schemas/doa";

function DoaListItem({
  item,
  slug,
}: {
  item: DoaItem;
  slug: string;
}) {
  return (
    <Link
      href={`/wirid/${slug}/${item.id}`}
      className="flex items-start gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent/40 active:bg-accent/60"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
        {item.urutan}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {item.judul || "Doa ke-" + item.urutan}
        </p>
        {item.arab && (
          <p
            dir="rtl"
            lang="ar"
            className="mt-1 line-clamp-2 text-right font-quran text-base leading-loose text-foreground"
          >
            {item.arab}
          </p>
        )}
        {item.terjemah && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {item.terjemah}
          </p>
        )}
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export default function WiridKategoriPage() {
  const mounted = useIsMounted();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, refetch } = useDoaByKategori(
    slug,
    page,
    limit,
  );

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/wirid"
          className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card transition-colors hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <PageHeader
          title={mounted ? (data?.kategori.nama ?? "Memuat...") : "Memuat..."}
          description={
            mounted && data ? `${data.total} doa dalam kategori ini` : undefined
          }
        />
      </div>

      {!mounted || isLoading ? (
        <LoadingScreen />
      ) : isError ? (
        <ErrorScreen onRetry={() => refetch()} />
      ) : !data || data.doa.length === 0 ? (
        <EmptyState
          icon={BookHeart}
          title="Tidak ada doa"
          description="Doa dalam kategori ini belum tersedia."
        />
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {data.doa.map((item) => (
              <li key={item.id}>
                <DoaListItem item={item} slug={slug} />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Sebelumnya
              </Button>
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Selanjutnya
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
