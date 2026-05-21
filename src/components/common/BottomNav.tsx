"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { bottomNavRoutes } from "@/config/routes";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="safe-pb pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:hidden"
    >
      <ul
        className="pointer-events-auto mx-auto grid max-w-md grid-cols-5 rounded-3xl border bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/85"
      >
        {bottomNavRoutes.map((route) => {
          const active =
            pathname === route.href || pathname?.startsWith(`${route.href}/`);
          const Icon = route.icon;
          return (
            <li key={route.href}>
              <Link
                href={route.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-3xl px-1 py-2.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="truncate">{route.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
