import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact KTM Apartments",
  description: "Contact KTM Apartments for listing support, partnerships, and platform assistance.",
};

const CONTACT_CHANNELS = [
  {
    label: "General Inquiries",
    value: "hello@ktmapartments.com",
    helper: "Questions about listings, accounts, or using the platform.",
  },
  {
    label: "Phone Support",
    value: "+977 01-XXXXXXX",
    helper: "Available during standard Kathmandu business hours.",
  },
  {
    label: "Office",
    value: "Kathmandu, Nepal",
    helper: "Local operations and verification support team.",
  },
];

export default function ContactPage() {
  return (
    <main className="bg-background">
      <section className="border-b border-border bg-card">
        <div className="container py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Contact</p>
          <h1 className="mt-2">We&apos;re Here to Help</h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            Reach out for support, partnership opportunities, or feedback. We review every request and respond as quickly
            as possible.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {CONTACT_CHANNELS.map((channel) => (
              <article key={channel.label} className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-base font-semibold">{channel.label}</h2>
                <p className="mt-2 text-lg font-medium text-foreground">{channel.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{channel.helper}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
