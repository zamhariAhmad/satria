import { z } from "zod";

export const doaKategoriSchema = z.object({
  id: z.number(),
  nama: z.string(),
  slug: z.string(),
  group_name: z.string(),
  total: z.number().nullable(),
});

export const doaKategoriListSchema = z.array(doaKategoriSchema);

export const doaItemSchema = z.object({
  id: z.number(),
  kategori_id: z.number(),
  judul: z.string(),
  arab: z.string(),
  latin: z.string(),
  terjemah: z.string(),
  fawaid: z.string().optional().default(""),
  catatan: z.string().optional().default(""),
  sumber: z.string(),
  urutan: z.number(),
});

export const doaByKategoriSchema = z.object({
  kategori: doaKategoriSchema,
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  doa: z.array(doaItemSchema),
});

export const doaSearchSchema = z.array(doaItemSchema);

export type DoaKategori = z.infer<typeof doaKategoriSchema>;
export type DoaItem = z.infer<typeof doaItemSchema>;
export type DoaByKategori = z.infer<typeof doaByKategoriSchema>;
export type DoaSearch = z.infer<typeof doaSearchSchema>;
