"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ListingForm } from "@/components/listings/ListingForm";
import { AgentUpgradeModal } from "@/components/listings/AgentUpgradeModal";
import { resolveListingCapabilities } from "@/lib/capabilities/listingCapabilities";
import { useAuthStore } from "@/lib/stores/authStore";
import type { User } from "@/lib/api/types";

type PersistedAuthEnvelope = {
  state?: {
    user?: User & { stats?: { active_listings?: number } };
  };
};

type NewListingRouteGateProps = {
  initialPurpose: "rent" | "sale";
};

function readPersistedUser(): (User & { stats?: { active_listings?: number } }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("ktm-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAuthEnvelope;
    return parsed.state?.user ?? null;
  } catch {
    return null;
  }
}

export function NewListingRouteGate({ initialPurpose }: NewListingRouteGateProps) {
  const { user: storeUser, upgradeToAgent } = useAuthStore();
  const [persistedUser, setPersistedUser] = useState<(User & { stats?: { active_listings?: number } }) | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [didDeclineUpgrade, setDidDeclineUpgrade] = useState(false);

  useEffect(() => {
    setPersistedUser(readPersistedUser());
  }, []);

  const user = useMemo(
    () => (storeUser as (User & { stats?: { active_listings?: number } }) | null) ?? persistedUser,
    [persistedUser, storeUser]
  );
  const canCreateListing =
    user?.role === "renter" || user?.role === "owner" || user?.role === "agent" || user?.role === "admin";
  const rawActiveListingCount = user?.stats?.active_listings;
  const hasKnownActiveListingCount = Number.isFinite(rawActiveListingCount);
  const activeListingCount = hasKnownActiveListingCount ? Number(rawActiveListingCount) : 0;
  const isNormalTierUser = user?.role === "renter" || user?.role === "owner";
  const listingCapabilities =
    user && hasKnownActiveListingCount
      ? resolveListingCapabilities({ role: user.role, activeListingCount })
      : null;
  const requiresAgentUpgrade = Boolean(isNormalTierUser && listingCapabilities?.requiresAgentUpgrade);

  const handleUpgradeConfirm = async () => {
    try {
      setIsUpgrading(true);
      await upgradeToAgent();
      toast.success("Your account has been upgraded to agent.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upgrade failed. Please try again.";
      toast.error(message);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!canCreateListing) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        You do not have permission to create a listing.
      </div>
    );
  }

  if (isNormalTierUser && !hasKnownActiveListingCount) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        We could not verify your active listing count. Please return to the dashboard and try again.
      </div>
    );
  }

  if (requiresAgentUpgrade) {
    return (
      <>
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          You have reached your free listing limit. Upgrade to an agent account to continue creating listings.
        </div>
        {didDeclineUpgrade ? (
          <div className="mt-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Upgrade canceled. You can stay on this page and review your listing details, then upgrade from your account
            settings when you are ready to publish another listing.
          </div>
        ) : (
          <AgentUpgradeModal
            open
            isLoading={isUpgrading}
            onCancel={() => setDidDeclineUpgrade(true)}
            onConfirm={handleUpgradeConfirm}
          />
        )}
      </>
    );
  }

  return <ListingForm initialPurpose={initialPurpose} />;
}
