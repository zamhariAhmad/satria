"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Notification } from "@/features/notification/schemas/notification";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type ListResponse = { items: Notification[]; total: number };

function useNotifications() {
  return useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => apiFetch<ListResponse>("/notifications"),
  });
}

export default function NotifikasiPage() {
  const { data, isLoading, isError, refetch } = useNotifications();

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        description="Pengumuman, tagihan baru, dan konfirmasi pembayaran."
      />
      {isLoading ? (
        <LoadingScreen />
      ) : isError ? (
        <ErrorScreen onRetry={() => refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Belum ada notifikasi"
          description="Notifikasi baru akan muncul di sini."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {data.items.map((n) => (
            <li
              key={n.id}
              className={cn(
                "rounded-xl border bg-card p-4",
                !n.readAt && "ring-1 ring-primary/20",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {n.body}
                  </p>
                </div>
                {!n.readAt ? (
                  <span
                    aria-label="Unread"
                    className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
                  />
                ) : null}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {formatDateTime(n.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
