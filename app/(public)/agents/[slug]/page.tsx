import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Agent Profile | KTM Apartments" };

type Props = { params: Promise<{ slug: string }> };

export default async function AgentProfilePage({ params }: Props) {
  const { slug } = await params;
  return (
    <div className="container py-10">
      <Link href="/agents" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to agents
      </Link>
      <div className="rounded-2xl border border-border bg-card p-8 text-center max-w-md mx-auto">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold mx-auto">A</div>
        <h1 className="mt-4 text-xl font-bold">Agent Profile</h1>
        <p className="text-muted-foreground">Agent profiles coming in Phase 2</p>
        <Link href="/apartments" className="btn-primary mt-6 inline-flex">Browse Listings</Link>
      </div>
    </div>
  );
}
