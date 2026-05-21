"use client";

import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  History,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/providers/auth-store";
import { useLogout } from "@/features/auth/api/use-auth";
import { usePaymentSummary } from "@/features/payment/api/use-payment-summary";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

const ROLE_LABEL: Record<string, string> = {
  wali: "Wali Santri",
  santri: "Santri",
  admin: "Admin Keuangan",
  pimpinan: "Pimpinan",
};

type SettingsRow = {
  href?: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: "emerald" | "amber" | "sky" | "rose" | "violet";
  badge?: string;
};

const TONE_BG: Record<SettingsRow["tone"], string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  sky: "bg-sky-100 text-sky-700",
  rose: "bg-rose-100 text-rose-700",
  violet: "bg-violet-100 text-violet-700",
};

const SETTINGS: SettingsRow[] = [
  {
    label: "Riwayat Pembayaran",
    description: "Lihat seluruh pembayaran yang sudah berhasil",
    href: "/utilitas/riwayat",
    icon: History,
    tone: "emerald",
  },
  {
    label: "Metode Pembayaran",
    description: "VA, QRIS, dan gateway tersedia",
    icon: CreditCard,
    tone: "sky",
    badge: "Segera",
  },
  {
    label: "Notifikasi",
    description: "Pengumuman dan tagihan terbaru",
    href: "/notifikasi",
    icon: Bell,
    tone: "amber",
  },
  {
    label: "Keamanan Akun",
    description: "Ganti password, perangkat aktif",
    icon: ShieldCheck,
    tone: "violet",
    badge: "Segera",
  },
  {
    label: "Bantuan",
    description: "Hubungi admin keuangan",
    icon: HelpCircle,
    tone: "rose",
  },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { data: summary } = usePaymentSummary();

  if (!user) {
    return (
      <div>
        <PageHeader title="Profil" description="Kamu belum login." />
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleLabel = ROLE_LABEL[user.role] ?? user.role;
  const totalBilled = summary?.totalBilled ?? 0;
  const totalPaid = summary?.totalPaid ?? 0;
  const completion =
    totalBilled === 0 ? 0 : Math.min(100, Math.round((totalPaid / totalBilled) * 100));

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-white/30">
                <AvatarFallback className="bg-white/15 text-lg font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                aria-label="Ganti foto"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white text-primary shadow-md ring-2 ring-primary/20 hover:bg-white/90"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold leading-tight">
                {user.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="muted"
                  className="bg-white/20 text-white hover:bg-white/25"
                >
                  {roleLabel}
                </Badge>
                <span className="inline-flex items-center gap-1 text-[11px] text-primary-foreground/80">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Anggota aktif
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between text-[11px]">
              <span className="uppercase tracking-wide text-primary-foreground/80">
                Progres Pelunasan
              </span>
              <span className="font-semibold">{completion}%</span>
            </div>
            <Progress
              value={completion}
              className="mt-1.5 h-2 bg-white/15"
              indicatorClassName="bg-white/90"
            />
          </div>
        </CardContent>

        <Separator className="bg-white/20" />

        <CardContent className="grid grid-cols-2 gap-0 p-0">
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-wide text-primary-foreground/80">
              Sudah Dibayar
            </p>
            <p className="mt-1 truncate text-base font-bold">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="border-l border-white/20 p-4">
            <p className="text-[10px] uppercase tracking-wide text-primary-foreground/80">
              Outstanding
            </p>
            <p className="mt-1 truncate text-base font-bold">
              {formatCurrency(summary?.totalOutstanding ?? 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact card */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
          <CardTitle className="text-sm">Informasi Kontak</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-primary">
            Edit
            <Pencil className="h-3 w-3" aria-hidden />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0 text-sm">
          <ContactRow icon={Mail} label="Email" value={user.email} />
          <ContactRow icon={Phone} label="Nomor HP" value={user.phone} />
          <ContactRow icon={MapPin} label="Lokasi" value="Indonesia" />
        </CardContent>
      </Card>

      {/* Settings list */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Pengaturan & Bantuan</CardTitle>
          <CardDescription className="text-xs">
            Kelola preferensi akun dan dapatkan bantuan.
          </CardDescription>
        </CardHeader>
        <Separator />
        <ul className="divide-y">
          {SETTINGS.map((row) => {
            const Icon = row.icon;
            const inner = (
              <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40 active:bg-accent/60">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    TONE_BG[row.tone],
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{row.label}</p>
                    {row.badge ? (
                      <Badge variant="muted" className="text-[10px]">
                        {row.badge}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.description}
                  </p>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </div>
            );
            return (
              <li key={row.label}>
                {row.href ? (
                  <Link href={row.href}>{inner}</Link>
                ) : (
                  <button type="button" className="block w-full text-left">
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        size="lg"
        className="w-full rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <LogOut className="h-4 w-4" aria-hidden />
        {logout.isPending ? "Keluar…" : "Keluar dari Akun"}
      </Button>

      <p className="pb-2 text-center text-[11px] text-muted-foreground">
        Satria · v1.0.0
      </p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}
