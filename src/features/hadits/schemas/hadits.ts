import { z } from "zod";

export const kitabSchema = z.object({
  slug: z.string(),
  nama: z.string(),
  jumlah: z.number(),
});
export type Kitab = z.infer<typeof kitabSchema>;

export const kitabListSchema = z.object({
  kitab: z.array(kitabSchema),
});
export type KitabList = z.infer<typeof kitabListSchema>;

export const haditsSchema = z.object({
  nomor: z.number(),
  kitab: z.string(),
  arab: z.string(),
  terjemah: z.string(),
  has_terjemah: z.boolean().optional(),
});
export type Hadits = z.infer<typeof haditsSchema>;

export const haditsByKitabSchema = z.object({
  kitab: z.string(),
  nama: z.string().optional(),
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
  hadiths: z.array(haditsSchema),
});
export type HaditsByKitab = z.infer<typeof haditsByKitabSchema>;

export const haditsSearchSchema = z.object({
  q: z.string(),
  kitab: z.string().optional().nullable(),
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
  results: z.array(haditsSchema),
});
export type HaditsSearch = z.infer<typeof haditsSearchSchema>;
