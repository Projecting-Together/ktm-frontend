"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  Eye,
  MessageCircle,
  Calendar,
  Settings,
  Building2,
  BarChart2,
  Newspaper,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import {
  DASHBOARD_MEMBER_HUB_TITLE,
  DASHBOARD_NAV_GROUPS,
  DASHBOARD_NEW_LISTING_LABEL,
} from "@/shared/ui/shellNav";
import { DASHBOARD_LISTINGS_NEW_PATH } from "@/lib/constants/memberDashboardRoutes";
import type { ShellNavItemDef } from "@/shared/ui/shellNav";

const ICON_BY_ID: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  favorites: Heart,
  recent: Eye,
  "inquiries-sent": MessageCircle,
  "visits-mine": Calendar,
  settings: Settings,
  "my-listings": Building2,
  "lead-inbox": MessageCircle,
  "lead-visits": Calendar,
  news: Newspaper,
  analytics: BarChart2,
};

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navClass = (active: boolean) =>
    cn(
      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  const renderItem = (item: ShellNavItemDef) => {
    const Icon = ICON_BY_ID[item.id] ?? LayoutDashboard;
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    return (
      <Link key={item.id} href={item.href} className={navClass(active)}>
        <Icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-6 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 flex flex-col gap-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{DASHBOARD_MEMBER_HUB_TITLE}</p>
            {DASHBOARD_NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">{group.title}</p>
                <div className="flex flex-col gap-1">{group.items.map((item) => renderItem(item))}</div>
              </div>
            ))}
            <div className="border-t border-border pt-4">
              <Link href={DASHBOARD_LISTINGS_NEW_PATH} className="btn-primary w-full justify-center gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> {DASHBOARD_NEW_LISTING_LABEL}
              </Link>
            </div>
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
