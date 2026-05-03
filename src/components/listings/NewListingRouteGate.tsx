"use client";

import { useEffect, useMemo, useState } from "react";
import { ListingForm } from "@/components/listings/ListingForm";
import { resolveListingCapabilities } from "@/lib/capabilities/listingCapabilities";
import { resolveMemberCapabilities } from "@/lib/capabilities/memberCapabilities";
import { USER_ROLE_USER } from "@/lib/constants/userRole";
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
  const { user: storeUser } = useAuthStore();
  const [persistedUser, setPersistedUser] = useState<(User & { stats?: { active_listings?: number } }) | null>(null);

  useEffect(() => {
    setPersistedUser(readPersistedUser());
  }, []);

  const user = useMemo(
    () => (storeUser as (User & { stats?: { active_listings?: number } }) | null) ?? persistedUser,
    [persistedUser, storeUser]
  );
  const memberCaps = useMemo(
    () => (user ? resolveMemberCapabilities({ user }) : null),
    [user],
  );
  const canCreateListing = Boolean(memberCaps?.canCreateListing);
  const rawActiveListingCount = user?.stats?.active_listings;
  const hasKnownActiveListingCount = Number.isFinite(rawActiveListingCount);
  const activeListingCount = hasKnownActiveListingCount ? Number(rawActiveListingCount) : 0;
  const isDefaultUserAccount = user?.role === USER_ROLE_USER;
  const listingCapabilities =
    user && hasKnownActiveListingCount
      ? resolveListingCapabilities({ role: user.role, activeListingCount })
      : null;

  if (!canCreateListing) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        You do not have permission to create a listing.
      </div>
    );
  }

  if (isDefaultUserAccount && !hasKnownActiveListingCount) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        We could not verify your active listing count. Please return to the dashboard and try again.
      </div>
    );
  }

  if (
    listingCapabilities &&
    !listingCapabilities.canCreateWithoutUpgrade &&
    user?.role === USER_ROLE_USER
  ) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        You have reached your free listing limit for this account.
      </div>
    );
  }

  return <ListingForm initialPurpose={initialPurpose} />;
}
