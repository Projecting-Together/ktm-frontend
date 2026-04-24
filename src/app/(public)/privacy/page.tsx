import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | KTM Apartments",
  description: "Understand how KTM Apartments collects, uses, and protects user information.",
};

export default function PrivacyPage() {
  return (
    <main className="bg-background">
      <section className="border-b border-border bg-card">
        <div className="container py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Privacy</p>
          <h1 className="mt-2">Privacy Policy</h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            We only collect information required to deliver secure account access, listing workflows, and better search
            quality. We do not sell personal data.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-4xl space-y-8">
          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Information We Collect</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Account details, listing submissions, and usage events needed for security, reliability, and product
              improvement.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">How We Use Data</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              We use data to operate the platform, verify listings, support users, and prevent abuse. Access is limited to
              authorized operations and support staff.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Your Controls</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              You can request account updates or deletion through support at any time. We retain only records required for
              legal or operational obligations.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
