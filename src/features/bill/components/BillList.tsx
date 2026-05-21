"use client";

import { Receipt } from "lucide-react";
import { useBills } from "@/features/bill/api/use-bills";
import { BillCard } from "./BillCard";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import type { BillStatus } from "@/features/bill/schemas/bill";

type BillListProps = {
  status?: BillStatus;
};

export function BillList({ status }: BillListProps) {
  const { data, isLoading, isError, refetch } = useBills({ status });

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorScreen onRetry={() => refetch()} />;

  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No bills here"
        description="Bills will appear once they are issued."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((bill) => (
        <li key={bill.id}>
          <BillCard bill={bill} />
        </li>
      ))}
    </ul>
  );
}
