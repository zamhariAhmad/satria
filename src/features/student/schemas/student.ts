import { z } from "zod";

export const studentSchema = z.object({
  id: z.string(),
  nis: z.string(),
  name: z.string(),
  className: z.string(),
  photoUrl: z.string().url().optional(),
  waliId: z.string(),
});
export type Student = z.infer<typeof studentSchema>;
