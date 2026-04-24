import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | KTM Apartments",
  description: "Review the terms that govern use of KTM Apartments services and listings.",
};

export default function TermsPage() {
  return (
    <main className="bg-background">
      <section className="border-b border-border bg-card">
        <div className="container py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Terms</p>
          <h1 className="mt-2">Terms of Service</h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            By using KTM Apartments, you agree to provide accurate information, follow platform rules, and respect
            applicable local laws.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-4xl space-y-8">
          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Account Responsibilities</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Users are responsible for account activity, credential security, and truthful profile and listing data.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Listing Standards</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Listings must reflect real properties and accurate availability. Misleading or fraudulent content may be
              removed and can result in account restrictions.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Service Availability</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              We continuously improve platform reliability but cannot guarantee uninterrupted access during maintenance or
              unexpected outages.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
