"use client";
import Link from "next/link";
import { Eye } from "lucide-react";

export default function RecentlyViewedPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Recently Viewed</h1>
      <p className="text-muted-foreground mb-6">Properties you&apos;ve visited recently.</p>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <Eye className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold">No recently viewed listings</h3>
        <p className="mt-1 text-sm text-muted-foreground">Browse listings to start building your history.</p>
        <Link href="/listings" className="btn-primary mt-4">Browse listings</Link>
      </div>
    </div>
  );
}
