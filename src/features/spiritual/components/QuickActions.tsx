"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  Compass,
  ScrollText,
  HandHeart,
  BookOpenText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

type QuickAction = {
  label: string;
  icon: LucideIcon;
  tone: "emerald" | "amber" | "sky" | "rose" | "violet" | "indigo";
  href?: string;
};

const ACTIONS: QuickAction[] = [
  { label: "Quran", icon: BookOpen, tone: "emerald", href: "/quran" },
  { label: "Jadwal Sholat", icon: Clock, tone: "amber" },
  { label: "Kiblat", icon: Compass, tone: "sky" },
  { label: "Hadits", icon: BookOpenText, tone: "indigo", href: "/hadits" },
  { label: "Tahlil & Yasin", icon: ScrollText, tone: "rose" },
  { label: "Wirid & Doa", icon: HandHeart, tone: "violet", href: "/wirid" },
];

const TONE_BG: Record<QuickAction["tone"], string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  sky: "bg-sky-100 text-sky-700",
  rose: "bg-rose-100 text-rose-700",
  violet: "bg-violet-100 text-violet-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

export function QuickActions() {
  return (
    <section aria-label="Menu Cepat" className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Menu Cepat</h2>
      </div>
      <ul className="grid grid-cols-3 gap-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const inner = (
            <>
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${TONE_BG[a.tone]}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-[11px] font-medium leading-tight">
                {a.label}
              </span>
            </>
          );
          const cls =
            "flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2 text-center transition-colors hover:bg-accent/40 active:bg-accent/60";
          return (
            <li key={a.label}>
              {a.href ? (
                <Link href={a.href} className={cls}>
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => toast.info(`${a.label} segera hadir.`)}
                  className={cls}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
