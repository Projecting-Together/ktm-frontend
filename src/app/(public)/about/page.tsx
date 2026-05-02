import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About KTM Apartments",
  description: "Learn about KTM Apartments and our mission to improve trusted property discovery in Kathmandu.",
};

const VALUES = [
  {
    title: "Trust First",
    description: "We prioritize verified listings and transparent information so renters and buyers can decide with confidence.",
  },
  {
    title: "Local Focus",
    description: "Our platform is built specifically for Kathmandu Valley areas, pricing patterns, and housing preferences.",
  },
  {
    title: "Useful Tools",
    description: "From search filters to market context, every feature is designed to reduce friction in the home-finding journey.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-background">
      <section className="border-b border-border bg-card">
        <div className="container py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">About Us</p>
          <h1 className="mt-2">Built for Kathmandu&apos;s Housing Market</h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            KTM Apartments helps people discover apartments and homes through verified listings, local market understanding,
            and a cleaner digital experience for renters, buyers, and property owners.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {VALUES.map((value) => (
              <article key={value.title} className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">{value.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
