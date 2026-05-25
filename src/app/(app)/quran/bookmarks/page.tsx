"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useQuranStore } from "@/features/quran/store/quran-store";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function QuranBookmarksPage() {
  const mounted = useIsMounted();
  const bookmarks = useQuranStore((s) => s.bookmarks);
  const removeBookmark = useQuranStore((s) => s.removeBookmark);

  return (
    <div className="space-y-4">
      <Link
        href="/quran"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Daftar Surah
      </Link>

      <PageHeader
        title="Bookmark"
        description="Ayat yang kamu simpan untuk dibaca kembali."
      />

      {!mounted ? null : bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Belum ada bookmark"
          description="Tekan ikon bookmark di sebelah ayat untuk menyimpannya."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {bookmarks.map((b) => (
            <li
              key={`${b.surahNumber}-${b.ayahNumber}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-3"
            >
              <Link
                href={`/quran/${b.surahNumber}#ayah-${b.ayahNumber}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {b.surahNumber}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {b.surahName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Ayat {b.ayahNumber} · {formatDateTime(b.createdAt)}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  removeBookmark(b.surahNumber, b.ayahNumber);
                  toast.success("Bookmark dihapus");
                }}
                aria-label="Hapus bookmark"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
