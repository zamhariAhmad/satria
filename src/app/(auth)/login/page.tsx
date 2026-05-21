"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginInputSchema,
  type LoginInput,
} from "@/features/auth/schemas/auth";
import { useLogin } from "@/features/auth/api/use-auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/home";

  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { identifier: "", password: "", remember: true },
  });

  useEffect(() => {
    if (login.isSuccess) {
      toast.success("Selamat datang kembali.");
      router.replace(next);
    }
  }, [login.isSuccess, next, router]);

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onError: (err) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Login gagal. Coba lagi.";
        toast.error(message);
      },
    });
  });

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="identifier">Email atau Nomor HP</Label>
        <Input
          id="identifier"
          type="text"
          autoComplete="username"
          placeholder="wali@satria.test"
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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Lupa password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        {form.formState.errors.password ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          {...form.register("remember")}
        />
        Ingat saya di perangkat ini
      </label>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={login.isPending}
      >
        <LogIn className="h-4 w-4" aria-hidden />
        {login.isPending ? "Memproses…" : "Masuk"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Masuk</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gunakan akun yang sudah didaftarkan oleh pesantren.
      </p>

      <Suspense
        fallback={
          <div className="mt-6 h-40 animate-pulse rounded-md bg-muted" />
        }
      >
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Daftar
        </Link>
      </p>

      <div className="mt-4 rounded-lg border border-dashed bg-muted/40 p-3 text-[11px] text-muted-foreground">
        Demo: gunakan{" "}
        <code className="rounded bg-background px-1">wali@satria.test</code> /{" "}
        <code className="rounded bg-background px-1">password</code> atau{" "}
        <code className="rounded bg-background px-1">admin@satria.test</code> /{" "}
        <code className="rounded bg-background px-1">admin123</code>.
      </div>
    </div>
  );
}