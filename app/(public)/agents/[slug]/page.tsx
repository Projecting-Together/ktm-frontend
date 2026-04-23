import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { mapProfileDto, type ProfileDto } from "@/lib/contracts/profile";

export const metadata: Metadata = { title: "Agent Profile | KTM Apartments" };

type Props = { params: Promise<{ slug: string }> };

export default async function AgentProfilePage({ params }: Props) {
  const { slug } = await params;
  const agentDto = MOCK_AGENT_PROFILE_DTOS.find((item) => item.id === slug);
  if (!agentDto) {
    notFound();
  }
  const profile = mapProfileDto(agentDto);

  return (
    <div className="container py-10">
      <Link href="/agents" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to agents
      </Link>
      <div className="rounded-2xl border border-border bg-card p-8 max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
            {profile.initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.fullName}</h1>
            <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
            <p className="mt-3 text-sm text-muted-foreground">{profile.bio || "This agent has not added a public bio yet."}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-border p-3">
            <p className="text-muted-foreground">Active listings</p>
            <p className="mt-1 font-semibold">{profile.activeListings}</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-muted-foreground">Email</p>
            <p className="mt-1 font-semibold break-all">{profile.email}</p>
          </div>
        </div>

        <Link href="/apartments" className="btn-primary mt-6 inline-flex">
          Browse Listings
        </Link>
      </div>
    </div>
  );
}

const MOCK_AGENT_PROFILE_DTOS: ProfileDto[] = [
  {
    id: "1",
    email: "ramesh.agent@example.com",
    role: "agent",
    profile: {
      first_name: "Ramesh",
      last_name: "Sharma",
      bio: "Helping renters and owners close faster across central Kathmandu.",
      phone: "+9779800000001",
    },
    stats: {
      active_listings: 24,
    },
  },
  {
    id: "2",
    email: "sita.owner@example.com",
    role: "owner",
    profile: {
      first_name: "Sita",
      last_name: "Thapa",
      bio: "Owner-host focused on family-friendly apartments near schools and transit.",
      phone: "+9779800000002",
    },
    stats: {
      active_listings: 8,
    },
  },
  {
    id: "3",
    email: "bikash.kc@example.com",
    role: "agent",
    profile: {
      first_name: "Bikash",
      last_name: "KC",
      bio: "Local market specialist for Koteshwor and Baneshwor neighborhoods.",
      phone: "+9779800000003",
    },
    stats: {
      active_listings: 15,
    },
  },
];
