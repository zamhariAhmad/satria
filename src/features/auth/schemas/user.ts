import { z } from "zod";

export const userRoleSchema = z.enum(["wali", "santri", "admin", "pimpinan"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: userRoleSchema,
  avatarUrl: z.string().url().optional(),
});
export type User = z.infer<typeof userSchema>;
