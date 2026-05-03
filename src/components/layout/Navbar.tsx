"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Menu, X, Heart, Plus, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { shouldShowPreviewAsCustomerBanner } from "@/lib/constants/routeGuards";
import { useAuthStore } from "@/lib/stores/authStore";
import { resolveListingCapabilities } from "@/lib/capabilities/listingCapabilities";
import { PRIMARY_NAV_LINKS } from "@/shared/ui/publicNav";

type PostListingButtonProps = {
  onCreate: (href: string) => Promise<void>;
  className: string;
  iconClassName: string;
  label: string;
  closeMobileMenu?: () => void;
};

function PostListingButton({ onCreate, className, iconClassName, label, closeMobileMenu }: PostListingButtonProps) {
  const searchParams = useSearchParams();
  const contextPurpose = searchParams.get("purpose");
  const createListingHref = contextPurpose === "sale"
    ? "/dashboard/listings/new?purpose=sale"
    : "/dashboard/listings/new";

  return (
    <button
      type="button"
      onClick={async () => {
        closeMobileMenu?.();
        await onCreate(createListingHref);
      }}
      className={className}
    >
      <Plus className={iconClassName} />
      {label}
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, canCreateListing } = useAuthStore();
  const canPostListing = isAuthenticated && canCreateListing();
  const rawActiveListingCount = (user as { stats?: { active_listings?: number } } | null)?.stats?.active_listings;
  const hasKnownActiveListingCount = Number.isFinite(rawActiveListingCount);
  const activeListingCount = hasKnownActiveListingCount ? Number(rawActiveListingCount) : 0;
  const isDefaultUserAccount = user?.role === "user";
  const showPreviewBanner = shouldShowPreviewAsCustomerBanner(pathname, user?.role);

  const listingCapabilities = user
    ? resolveListingCapabilities({
        role: user.role,
        activeListingCount,
      })
    : null;

  const handleCreateListingEntry = async (createListingHref: string) => {
    if (!user) return;

    if (isDefaultUserAccount && !hasKnownActiveListingCount) {
      toast.error("Couldn't verify your active listings. Please retry in a moment.");
      return;
    }

    if (!listingCapabilities?.canCreateWithoutUpgrade) {
      toast.error("You've reached the listing limit for your account.");
      return;
    }

    router.push(createListingHref);
  };

  const dashboardHref = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="sticky top-0 z-40 w-full">
      {showPreviewBanner ? (
        <div
          role="region"
          aria-label="Preview as customer"
          className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-50"
        >
          <span className="font-semibold">Preview as customer</span>
          <span className="text-amber-900 dark:text-amber-100">
            {" "}
            — You are signed in as an administrator. Customer data and actions still follow your admin account and server
            rules.
          </span>
        </div>
      ) : null}
      <header className="w-full border-b border-border bg-card/95 backdrop-blur-sm">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <Building2 className="h-6 w-6 text-accent" />
          <span className="text-lg tracking-tight" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
            KTM<span className="text-accent">Apartments</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {PRIMARY_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                pathname.startsWith(link.href)
                  ? "text-accent"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard/favorites"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Heart className="h-4 w-4" />
                Saved
              </Link>

              {canPostListing && (
                <Suspense
                  fallback={
                    <button
                      type="button"
                      onClick={async () => {
                        await handleCreateListingEntry("/dashboard/listings/new");
                      }}
                      className="btn-primary gap-1.5 py-2 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Post Listing
                    </button>
                  }
                >
                  <PostListingButton
                    onCreate={handleCreateListingEntry}
                    className="btn-primary gap-1.5 py-2 text-xs"
                    iconClassName="h-3.5 w-3.5"
                    label="Post Listing"
                  />
                </Suspense>
              )}

              <Link
                href={dashboardHref}
                aria-label="Open dashboard profile menu"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold transition-opacity hover:opacity-80"
              >
                {user?.profile?.first_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link href="/register" className="btn-primary py-2 text-xs">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-nav-menu" className="border-t border-border bg-card px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-3">
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-accent/10 text-accent"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-border" />
            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  My Dashboard
                </Link>
                {canPostListing && (
                  <Suspense
                    fallback={
                      <button
                        type="button"
                        onClick={async () => {
                          setMobileOpen(false);
                          await handleCreateListingEntry("/dashboard/listings/new");
                        }}
                        className="btn-primary mt-2 justify-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        Post a Listing
                      </button>
                    }
                  >
                    <PostListingButton
                      onCreate={handleCreateListingEntry}
                      className="btn-primary mt-2 justify-center gap-1.5"
                      iconClassName="h-4 w-4"
                      label="Post a Listing"
                      closeMobileMenu={() => setMobileOpen(false)}
                    />
                  </Suspense>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary justify-center">
                  Sign in
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary justify-center">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
    </div>
  );
}
