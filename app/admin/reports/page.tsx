"use client";
import { Flag } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Reported Content</h1>
      <p className="text-muted-foreground mb-6">Review user-reported listings and content.</p>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <Flag className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold">No reports pending</h3>
        <p className="mt-1 text-sm text-muted-foreground">User reports will appear here for review.</p>
      </div>
    </div>
  );
}
