import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Phone, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Real Estate Agents in Kathmandu | KTM Apartments",
  description: "Connect with verified real estate agents and property managers in Kathmandu.",
};

// Static placeholder — will be replaced with real API data in Phase 2
const MOCK_AGENTS = [
  { id: "1", name: "Ramesh Sharma", role: "Agent", listings: 24, verified: true, area: "Thamel, Lazimpat" },
  { id: "2", name: "Sita Thapa", role: "Owner", listings: 8, verified: true, area: "Patan, Jawalakhel" },
  { id: "3", name: "Bikash KC", role: "Agent", listings: 15, verified: false, area: "Koteshwor, Baneshwor" },
];

export default function AgentsPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl text-center mb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Find an Expert</p>
        <h1 className="mt-2">Kathmandu Property Agents</h1>
        <p className="mt-3 text-muted-foreground">Work with verified agents who know the Kathmandu market inside out.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_AGENTS.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.id}`}
            className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                {agent.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold group-hover:text-accent">{agent.name}</h3>
                  {agent.verified && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                </div>
                <p className="text-sm text-muted-foreground capitalize">{agent.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {agent.listings} listings</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{agent.area}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
