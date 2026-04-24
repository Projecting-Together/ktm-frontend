"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Menu, X, Heart, Plus, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/authStore";
import { resolveListingCapabilities } from "@/lib/capabilities/listingCapabilities";
import { AgentUpgradeModal } from "@/components/listings/AgentUpgradeModal";

const NAV_LINKS = [
  { href: "/apartments", label: "Apartments" },
  { href: "/agents", label: "Agents" },
  { href: "/news", label: "News" },
  { href: "/market-listing", label: "Market Listing" },
];

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
    ? "/manage/listings/new?purpose=sale"
    : "/manage/listings/new";

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [pendingCreateListingHref, setPendingCreateListingHref] = useState("/manage/listings/new");
  const { user, isAuthenticated, upgradeToAgent } = useAuthStore();
  const canPostListing = user?.role === "renter" || user?.role === "owner" || user?.role === "agent" || user?.role === "admin";
  const rawActiveListingCount = (user as { stats?: { active_listings?: number } } | null)?.stats?.active_listings;
  const hasKnownActiveListingCount = Number.isFinite(rawActiveListingCount);
  const activeListingCount = hasKnownActiveListingCount ? Number(rawActiveListingCount) : 0;
  const isNormalTierUser = user?.role === "renter" || user?.role === "owner";

  const listingCapabilities = user
    ? resolveListingCapabilities({
        role: user.role,
        activeListingCount,
      })
    : null;

  const handleCreateListingEntry = async (createListingHref: string) => {
    if (!user) return;

    if (isNormalTierUser && !hasKnownActiveListingCount) {
      toast.error("Couldn't verify your active listings. Please retry in a moment.");
      return;
    }

    if (listingCapabilities?.requiresAgentUpgrade) {
      setPendingCreateListingHref(createListingHref);
      setShowUpgradeModal(true);
      return;
    }

    router.push(createListingHref);
  };

  const handleUpgradeConfirm = async () => {
    try {
      setIsUpgrading(true);
      await upgradeToAgent();
      setShowUpgradeModal(false);
      router.push(pendingCreateListingHref);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upgrade failed. Please try again.";
      toast.error(message);
    } finally {
      setIsUpgrading(false);
    }
  };

  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "owner" || user?.role === "agent"
      ? "/manage"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-sm">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <Building2 className="h-6 w-6 text-accent" />
          <span className="text-lg tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            KTM<span className="text-accent">Apartments</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
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
                        await handleCreateListingEntry("/manage/listings/new");
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
            {NAV_LINKS.map((link) => (
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
                          await handleCreateListingEntry("/manage/listings/new");
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
      <AgentUpgradeModal
        open={showUpgradeModal}
        isLoading={isUpgrading}
        onCancel={() => setShowUpgradeModal(false)}
        onConfirm={handleUpgradeConfirm}
      />
    </header>
  );
}
