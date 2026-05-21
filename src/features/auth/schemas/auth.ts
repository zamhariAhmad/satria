import { z } from "zod";
import { userSchema } from "@/features/auth/schemas/user";

export const loginInputSchema = z.object({
  identifier: z
    .string()
    .min(3, "Email atau nomor HP minimal 3 karakter")
    .max(120),
  password: z.string().min(6, "Password minimal 6 karakter"),
  remember: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const registerInputSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(80),
    email: z.string().email("Email tidak valid"),
    phone: z
      .string()
      .min(8, "Nomor HP minimal 8 digit")
      .max(20, "Nomor HP terlalu panjang")
      .regex(/^[0-9+\-\s]+$/, "Hanya angka, +, atau strip"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
    agree: z.boolean().refine((v) => v === true, {
      message: "Anda harus menyetujui syarat & ketentuan",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(3, "Masukkan email atau nomor HP terdaftar")
    .max(120),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const authSessionSchema = z.object({
  token: z.string(),
  user: userSchema,
});
export type AuthSession = z.infer<typeof authSessionSchema>;
