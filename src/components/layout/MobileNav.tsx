"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Home, Search, Heart, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/authStore";
import { MOBILE_NAV_ITEMS } from "@/shared/ui/publicNav";

const MOBILE_NAV_ICONS: LucideIcon[] = [Home, Search, Plus, Heart, User];

const NAV_ITEMS = MOBILE_NAV_ITEMS.map((item, index) => ({
  ...item,
  icon: MOBILE_NAV_ICONS[index]!,
}));

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="mobile-nav safe-area-pb">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        // Hide Post and Saved/Profile if not authenticated
        if (!isAuthenticated && item.href.startsWith("/dashboard")) {
          const loginHref = "/login";
          return (
            <Link
              key={item.id}
              href={loginHref}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 transition-colors",
              item.accent
                ? "text-accent"
                : isActive
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.accent ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-md">
                <Icon className="h-5 w-5" />
              </span>
            ) : (
              <Icon className={cn("h-5 w-5", isActive && "fill-accent/20")} />
            )}
            {!item.accent && (
              <span className={cn("text-[10px] font-medium", isActive && "text-accent")}>
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
