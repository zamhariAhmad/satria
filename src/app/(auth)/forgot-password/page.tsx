"use client";

import Link from "next/link";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/schemas/auth";
import { useForgotPassword } from "@/features/auth/api/use-auth";

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    forgot.mutate(values);
  });

  return (
    <div>
      <Link
        href="/login"
        className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Masuk
      </Link>

      <h1 className="text-2xl font-bold">Lupa Password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Masukkan email atau nomor HP terdaftar. Kami kirimkan tautan reset.
      </p>

      {forgot.isSuccess ? (
        <div className="mt-6 rounded-xl border bg-primary/5 p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <MailCheck className="h-4 w-4" aria-hidden />
            Tautan terkirim
          </div>
          <p className="mt-1 text-muted-foreground">
            {forgot.data.message}
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="identifier">Email atau Nomor HP</Label>
            <Input
              id="identifier"
              type="text"
              inputMode="email"
              aria-invalid={!!form.formState.errors.identifier}
              {...form.register("identifier")}
            />
            {form.formState.errors.identifier ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.identifier.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={forgot.isPending}
          >
            <KeyRound className="h-4 w-4" aria-hidden />
            {forgot.isPending ? "Memproses…" : "Kirim Tautan Reset"}
          </Button>
        </form>
      )}
    </div>
  );
}