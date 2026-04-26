"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyInquiries } from "@/lib/api/client";
import type { Inquiry } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";

type InquiryGroup = {
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  ownerLabel: string;
  inquiries: Inquiry[];
  hasNew: boolean;
};

type InquiryWithOwner = Inquiry & {
  owner?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
};

function hasOwnerProfile(inquiry: Inquiry): inquiry is InquiryWithOwner {
  return "owner" in inquiry && typeof inquiry.owner === "object" && inquiry.owner !== null;
}

function formatOwnerLabel(inquiry: Inquiry): string {
  if (hasOwnerProfile(inquiry) && inquiry.owner?.first_name && inquiry.owner.last_name) {
    return `${inquiry.owner.first_name.charAt(0).toUpperCase()}. ${inquiry.owner.last_name}`;
  }

  const ownerRole = inquiry.owner_id.split("-")[1] ?? "owner";
  const normalized = ownerRole.charAt(0).toUpperCase() + ownerRole.slice(1);
  return `${normalized.charAt(0)}. ${normalized}`;
}

export default function InquiriesPage() {
  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["inquiries", "sent"],
    queryFn: async () => {
      const res = await getMyInquiries();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
  });
  const groupedInquiries = useMemo<InquiryGroup[]>(() => {
    const grouped = new Map<string, InquiryGroup>();

    for (const inquiry of inquiries ?? []) {
      const listingId = inquiry.listing_id;
      const listingTitle = inquiry.listing?.title ?? "Property";
      const listingImage = inquiry.listing?.images?.[0]?.image_url;
      const existing = grouped.get(listingId);

      if (existing) {
        existing.inquiries.push(inquiry);
        if (inquiry.status === "pending") existing.hasNew = true;
      } else {
        grouped.set(listingId, {
          listingId,
          listingTitle,
          listingImage,
          ownerLabel: formatOwnerLabel(inquiry),
          inquiries: [inquiry],
          hasNew: inquiry.status === "pending",
        });
      }
    }

    return Array.from(grouped.values());
  }, [inquiries]);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (listingId: string) => {
    setCollapsedGroups((previous) => ({
      ...previous,
      [listingId]: !previous[listingId],
    }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Inquiries</h1>
      <p className="text-muted-foreground mb-6">Messages you've sent to property owners.</p>

      {isLoading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : !inquiries?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold">No inquiries yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Find a listing you like and send an inquiry to the owner.</p>
          <Link href="/apartments" className="btn-primary mt-4">Browse Apartments</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedInquiries.map((group) => {
            const isCollapsed = collapsedGroups[group.listingId] ?? false;
            return (
              <section key={group.listingId} className="rounded-xl border border-border bg-card p-4">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.listingId)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={!isCollapsed}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {group.listingImage ? (
                      <img
                        src={group.listingImage}
                        alt={group.listingTitle}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-muted" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">{group.listingTitle}</h3>
                        {group.hasNew ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                            </span>
                            New
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {group.ownerLabel} • {group.inquiries.length} {group.inquiries.length === 1 ? "inquiry" : "inquiries"}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
                </button>

                {!isCollapsed ? (
                  <div className="mt-3 space-y-3 border-t border-border/70 pt-3">
                    {group.inquiries.map((inq) => (
                      <div key={inq.id} className="rounded-lg bg-muted/50 p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <Link href={`/apartments/${inq.listing_id}`} className="text-xs font-semibold hover:text-accent">
                              View Property
                            </Link>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{inq.message}</p>
                            {inq.owner_reply && (
                              <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                                <p className="mb-1 text-xs font-semibold text-accent">Owner replied:</p>
                                <p className="text-muted-foreground">{inq.owner_reply}</p>
                              </div>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                              inq.status === "replied" ? "bg-emerald-100 text-emerald-700" :
                              inq.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                            }`}>{inq.status}</span>
                            <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(inq.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
