import { z } from "zod";

export const kabkotaItemSchema = z.object({
  id: z.string(),
  lokasi: z.string(),
});
export type KabkotaItem = z.infer<typeof kabkotaItemSchema>;

export const kabkotaListSchema = z.array(kabkotaItemSchema);

export const sholatTimesSchema = z.object({
  tanggal: z.string().optional(),
  imsak: z.string(),
  subuh: z.string(),
  terbit: z.string(),
  dhuha: z.string(),
  dzuhur: z.string(),
  ashar: z.string(),
  maghrib: z.string(),
  isya: z.string(),
});
export type SholatTimes = z.infer<typeof sholatTimesSchema>;

export const sholatJadwalTodaySchema = z.object({
  id: z.string(),
  kabko: z.string(),
  prov: z.string().optional(),
  jadwal: z.record(z.string(), sholatTimesSchema),
});
export type SholatJadwalToday = z.infer<typeof sholatJadwalTodaySchema>;
