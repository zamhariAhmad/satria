"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { PaymentSummaryWidget } from "@/features/payment/components/PaymentSummaryWidget";
import { CategoryMenuGrid } from "@/features/payment/components/CategoryMenuGrid";

export default function KeuanganPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Keuangan"
        description="Ringkasan dan kategori tagihan santri kamu."
      />

      <PaymentSummaryWidget />
      <CategoryMenuGrid />
    </div>
  );
}
