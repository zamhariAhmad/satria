"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Catches stale URLs from the previous routing scheme, e.g.
 *   /hadits/sunan_nasai/11   -> /hadits/sunan_nasai?n=11
 * and forwards the user before showing the 404 fallback.
 *
 * Static export (`output: "export"`) only emits HTML for params declared in
 * `generateStaticParams`, so any path outside that set lands here. We use
 * the actual `window.location.pathname` because Next.js does not pass route
 * params to a not-found page.
 */
export default function NotFound() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const match = window.location.pathname.match(
      /^\/hadits\/([^/]+)\/(\d+)\/?$/,
    );
    if (!match) return;
    const [, slug, nomor] = match;
    setRedirecting(true);
    // replace() avoids leaving the 404 in history.
    router.replace(`/hadits/${slug}?n=${nomor}`);
  }, [router]);

  if (redirecting) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Mengalihkan…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-sm text-muted-foreground">
        Tautan yang Anda buka tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        href="/home"
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
