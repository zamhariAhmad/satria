"use client";

import Link from "next/link";
import {
  History,
  FileText,
  Settings,
  HelpCircle,
  CreditCard,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { toast } from "sonner";

type UtilityItem = {
  href?: string;
  label: string;
  description: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

const ITEMS: UtilityItem[] = [
  {
    href: "/utilitas/riwayat",
    label: "Riwayat Pembayaran",
    description: "Daftar pembayaran yang sudah berhasil.",
    icon: History,
  },
  {
    label: "Kwitansi Digital",
    description: "Unduh kwitansi pembayaran kamu.",
    icon: FileText,
    comingSoon: true,
  },
  {
    label: "Metode Pembayaran",
    description: "VA, QRIS, dan gateway tersedia.",
    icon: CreditCard,
    comingSoon: true,
  },
  {
    label: "Kalender Akademik",
    description: "Jadwal penting pesantren.",
    icon: Calendar,
    comingSoon: true,
  },
  {
    label: "Pengaturan",
    description: "Notifikasi, bahasa, dan preferensi.",
    icon: Settings,
    comingSoon: true,
  },
  {
    label: "Bantuan",
    description: "Hubungi admin keuangan.",
    icon: HelpCircle,
    comingSoon: true,
  },
];

export default function UtilitasPage() {
  return (
    <div>
      <PageHeader
        title="Utilitas"
        description="Akses cepat fitur pendukung."
      />

      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-semibold">{item.label}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                {item.description}
              </p>
              {item.comingSoon ? (
                <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Segera
                </span>
              ) : null}
            </>
          );

          const className =
            "flex flex-col rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/40 active:bg-accent/60";

          if (item.href && !item.comingSoon) {
            return (
              <Link key={item.label} href={item.href} className={className}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              className={className}
              onClick={() => toast.info(`${item.label} segera hadir.`)}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
