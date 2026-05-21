"use client";

import { Wallet, Receipt, AlertCircle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard";
import { formatCurrency, formatDateTime } from "@/lib/format";

export function DashboardSummary() {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return <ErrorScreen onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Outstanding"
          value={formatCurrency(data.totalOutstanding)}
          icon={Wallet}
          tone="warning"
          hint={`${data.overdueCount} overdue`}
        />
        <StatCard
          label="Collected"
          value={formatCurrency(data.totalPaid)}
          icon={TrendingUp}
          tone="success"
          hint={`${Math.round(data.collectionRate * 100)}% of billed`}
        />
        <StatCard
          label="Total billed"
          value={formatCurrency(data.totalBilled)}
          icon={Receipt}
        />
        <StatCard
          label="Overdue"
          value={data.overdueCount.toString()}
          icon={AlertCircle}
          tone={data.overdueCount > 0 ? "danger" : "default"}
        />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent payments</h2>
        </div>
        {data.recentPayments.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No payments yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y">
            {data.recentPayments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.studentName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDateTime(p.paidAt)} · {p.method.toUpperCase()}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-primary">
                  {formatCurrency(p.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
