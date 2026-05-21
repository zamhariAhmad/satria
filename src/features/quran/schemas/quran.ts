import { z } from "zod";

export const surahListItemSchema = z.object({
  number: z.number(),
  name: z.string(),
  name_latin: z.string(),
  number_of_ayahs: z.number(),
  translation: z.string(),
  revelation: z.string(),
  description: z.string().optional(),
  audio_url: z.string().optional(),
});
export type SurahListItem = z.infer<typeof surahListItemSchema>;

export const ayahSchema = z.object({
  id: z.number(),
  surah_number: z.number(),
  ayah_number: z.number(),
  arab: z.string(),
  translation: z.string(),
  audio_url: z.string().optional(),
  image_url: z.string().optional(),
});
export type Ayah = z.infer<typeof ayahSchema>;

export const surahDetailSchema = surahListItemSchema.extend({
  ayahs: z.array(ayahSchema),
});
export type SurahDetail = z.infer<typeof surahDetailSchema>;

export const tafsirEntrySchema = z
  .union([
    z.object({
      short: z.string().optional(),
      long: z.string().optional(),
    }),
    z.string(),
  ])
  .transform((val) =>
    typeof val === "string" ? { long: val, short: undefined } : val,
  );
export type TafsirEntry = { short?: string; long?: string };

export const ayahTafsirSchema = z.object({
  kemenag: tafsirEntrySchema.optional(),
  quraish: tafsirEntrySchema.optional(),
  jalalayn: tafsirEntrySchema.optional(),
});
export type AyahTafsir = z.infer<typeof ayahTafsirSchema>;

export const sajdaSchema = z.object({
  recommended: z.boolean().optional(),
  obligatory: z.boolean().optional(),
});

export const ayahMetaSchema = z.object({
  juz: z.number().optional(),
  page: z.number().optional(),
  manzil: z.number().optional(),
  ruku: z.number().optional(),
  hizb_quarter: z.number().optional(),
  sajda: sajdaSchema.optional(),
});
export type AyahMeta = z.infer<typeof ayahMetaSchema>;

export const ayahDetailSchema = ayahSchema.extend({
  tafsir: ayahTafsirSchema.optional(),
  meta: ayahMetaSchema.optional(),
});
export type AyahDetail = z.infer<typeof ayahDetailSchema>;

export const myQuranEnvelopeSchema = z.object({
  status: z.boolean(),
  data: z.unknown(),
});
