"use client";

import Link from "next/link";
import { use, useEffect } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { useHaditsDetail, useKitabHadits } from "@/features/hadits/api/use-hadits";
import { prettifyKitabSlug, cleanHaditsText } from "@/features/hadits/lib/format";
import { useIsMounted } from "@/lib/use-is-mounted";

type Params = Promise<{ slug: string; nomor: string }>;

export default function HaditsDetailPage({ params }: { params: Params }) {
  const mounted = useIsMounted();
  const { slug, nomor: nomorStr } = use(params);
  const nomor = Number(nomorStr);

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
  const next = total && nomor < total ? nomor + 1 : nomor + 1;

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
            <Link href={`/hadits/${slug}/${prev}`}>
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
        {next && (!total || next <= total) ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/hadits/${slug}/${next}`}>
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
