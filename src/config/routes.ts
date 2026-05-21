import type { LucideIcon } from "lucide-react";
import { Home, Wallet, Bell, LayoutGrid, User } from "lucide-react";

export type AppRoute = {
  href: string;
  label: string;
  icon: LucideIcon;
  protected?: boolean;
};

export const bottomNavRoutes: AppRoute[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/keuangan", label: "Keuangan", icon: Wallet, protected: true },
  { href: "/notifikasi", label: "Notifikasi", icon: Bell, protected: true },
  { href: "/utilitas", label: "Utilitas", icon: LayoutGrid, protected: true },
  { href: "/profile", label: "Profile", icon: User, protected: true },
];

/**
 * Path prefixes that require an authenticated user. Public spiritual
 * features (home, quran, kiblat, tahlil, yasin, hadits, ...) are intentionally
 * left out so guests can use them.
 */
export const PROTECTED_PREFIXES = [
  "/keuangan",
  "/notifikasi",
  "/utilitas",
  "/profile",
] as const;

export function isProtectedPath(pathname: string | null | undefined) {
  if (!pathname) return false;
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
