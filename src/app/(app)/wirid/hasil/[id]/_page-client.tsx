"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, BookHeart, Quote } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDoaDetail } from "@/features/spiritual/api/use-doa";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function WiridHasilDetailPage() {
  const mounted = useIsMounted();
  const params = useParams<{ id: string }>();
  const id = params.id ? parseInt(params.id, 10) : null;
  const { data, isLoading, isError, refetch } = useDoaDetail(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/wirid"
          className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card transition-colors hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <PageHeader title={mounted ? (data?.judul || "Detail Doa") : "Detail Doa"} />
      </div>

      {!mounted || isLoading ? (
        <LoadingScreen />
      ) : isError ? (
        <ErrorScreen onRetry={() => refetch()} />
      ) : !data ? null : (
        <div className="space-y-4">
          {data.arab && (
            <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5">
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-right font-quran text-2xl leading-[2.2] text-foreground"
                >
                  {data.arab}
                </p>
              </CardContent>
            </Card>
          )}

          {data.latin && (
            <div className="rounded-xl border bg-card px-4 py-3">
              <p className="text-sm italic leading-relaxed text-muted-foreground">
                {data.latin}
              </p>
            </div>
          )}

          {data.terjemah && (
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BookHeart className="h-4 w-4" /> Terjemah
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <p className="text-sm leading-relaxed">{data.terjemah}</p>
              </CardContent>
            </Card>
          )}

          {data.fawaid && (
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Quote className="h-4 w-4" /> Faedah
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.fawaid}
                </p>
              </CardContent>
            </Card>
          )}

          {data.catatan && (
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">{data.catatan}</p>
            </div>
          )}

          {data.sumber && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sumber:</span>
              <Badge variant="secondary" className="text-xs">
                {data.sumber}
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
