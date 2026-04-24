"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Heart, Eye, MessageCircle, Calendar, GitCompare, Settings, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/dashboard/favorites", icon: Heart, label: "Saved" },
  { href: "/dashboard/recently-viewed", icon: Eye, label: "Recently Viewed" },
  { href: "/dashboard/inquiries", icon: MessageCircle, label: "Inquiries" },
  { href: "/dashboard/visits", icon: Calendar, label: "Visit Requests" },
  { href: "/dashboard/compare", icon: GitCompare, label: "Compare" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-6 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 flex flex-col gap-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Renter Dashboard</p>
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  <Icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
