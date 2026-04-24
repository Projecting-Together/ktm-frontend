"use client";
import Link from "next/link";
import { GitCompare } from "lucide-react";

export default function ComparePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Compare Properties</h1>
      <p className="text-muted-foreground mb-6">Side-by-side comparison of your saved listings.</p>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <GitCompare className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold">No properties to compare</h3>
        <p className="mt-1 text-sm text-muted-foreground">Save at least 2 listings to compare them side by side.</p>
        <Link href="/apartments" className="btn-primary mt-4">Browse Apartments</Link>
      </div>
    </div>
  );
}
