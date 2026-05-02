"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, MessageCircle, Calendar, BarChart2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import {
  MANAGE_NEW_LISTING_CTA,
  MANAGE_SHELL_NAV,
  MANAGE_SHELL_SECTION_TITLE,
} from "@/shared/ui/shellNav";

const MANAGE_ICONS = [LayoutDashboard, Building2, MessageCircle, Calendar, BarChart2] as const;

const NAV = MANAGE_SHELL_NAV.map((item, index) => ({
  ...item,
  icon: MANAGE_ICONS[index]!,
}));

export default function ManageLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-6 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 flex flex-col gap-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{MANAGE_SHELL_SECTION_TITLE}</p>
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.id} href={item.href}
                  className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  <Icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-border pt-4">
              <Link href="/manage/listings/new" className="btn-primary w-full justify-center gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> {MANAGE_NEW_LISTING_CTA}
              </Link>
            </div>
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
