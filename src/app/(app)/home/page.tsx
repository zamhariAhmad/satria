"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { HijriDate } from "@/features/spiritual/components/HijriDate";
import { PrayerTimes } from "@/features/spiritual/components/PrayerTimes";
import { QuickActions } from "@/features/spiritual/components/QuickActions";
import { LastReadCard } from "@/features/quran/components/LastReadCard";
import { useAuthStore } from "@/providers/auth-store";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Assalamu'alaikum${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Semoga harimu penuh keberkahan."
      />

      <HijriDate />
      <PrayerTimes />
      <QuickActions />
      <LastReadCard />
    </div>
  );
}
