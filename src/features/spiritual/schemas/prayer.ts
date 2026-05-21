import { z } from "zod";

export const prayerNameSchema = z.enum([
  "imsak",
  "subuh",
  "terbit",
  "dhuha",
  "dzuhur",
  "ashar",
  "maghrib",
  "isya",
]);
export type PrayerName = z.infer<typeof prayerNameSchema>;

export const prayerTimeSchema = z.object({
  name: prayerNameSchema,
  label: z.string(),
  time: z.string(),
});
export type PrayerTime = z.infer<typeof prayerTimeSchema>;

export const prayerScheduleSchema = z.object({
  city: z.string(),
  date: z.string(),
  hijriDate: z.string(),
  times: z.array(prayerTimeSchema),
});
export type PrayerSchedule = z.infer<typeof prayerScheduleSchema>;
