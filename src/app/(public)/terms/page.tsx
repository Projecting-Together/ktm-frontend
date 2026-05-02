import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | KTM Apartments",
  description: "Review the terms that govern use of KTM Apartments services and listings.",
};

export default function TermsPage() {
  return (
    <main className="bg-background">
      <section className="border-b border-border bg-card">
        <div className="container py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Legal</p>
          <h1 className="mt-2">Terms of Use</h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            By accessing or using KTM Apartments, you agree to these terms. If you do not agree, please do not use the
            platform.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-3xl">
          <article className="prose prose-neutral max-w-none text-foreground prose-headings:font-semibold prose-a:text-accent">
            <p className="text-sm text-muted-foreground not-prose">
              Last updated: May 2026. These terms are a general template for product development; obtain qualified legal
              review before relying on them commercially.
            </p>

            <h2>Eligibility and accounts</h2>
            <p>
              You must have legal capacity to agree to these terms in your jurisdiction. You are responsible for all
              activity under your account and for keeping your login credentials confidential.
            </p>

            <h2>Listings and content</h2>
            <p>You agree that:</p>
            <ul>
              <li>Listings must describe real properties with accurate availability, pricing context, and photos you have rights to use;</li>
              <li>You will not post misleading, discriminatory, illegal, or harmful content;</li>
              <li>We may moderate, edit, or remove content that violates these terms or applicable law.</li>
            </ul>

            <h2>Platform role</h2>
            <p>
              KTM Apartments provides a discovery and communication layer. Unless expressly stated for a specific
              transaction, we are not a broker, landlord, or party to rental or sale agreements between users.
            </p>

            <h2>User conduct</h2>
            <p>You will not misuse the service, including by scraping at unreasonable rates, probing security, harassing users, or circumventing technical limits.</p>

            <h2>Intellectual property</h2>
            <p>
              The platform design, branding, and software are owned by KTM Apartments or its licensors. You retain rights
              to content you submit but grant us a licence to host, display, and distribute it as needed to operate the
              service.
            </p>

            <h2>Disclaimer</h2>
            <p>
              The service is provided “as is” to the extent permitted by law. We do not warrant uninterrupted or error-free
              operation. Users are responsible for verifying property details and complying with local regulations.
            </p>

            <h2>Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law in Nepal, KTM Apartments and its affiliates will not be
              liable for indirect, incidental, special, or consequential damages arising from use of the platform.
            </p>

            <h2>Indemnity</h2>
            <p>
              You agree to indemnify and hold harmless KTM Apartments against claims arising from your content, listings,
              or misuse of the service, subject to applicable law.
            </p>

            <h2>Suspension and termination</h2>
            <p>
              We may suspend or terminate access for breach of these terms or operational necessity. You may stop using
              the service at any time.
            </p>

            <h2>Governing law</h2>
            <p>
              These terms are governed by the laws of Nepal, without regard to conflict-of-law rules. Courts in Kathmandu
              shall have exclusive jurisdiction, subject to mandatory consumer protections where applicable.
            </p>

            <h2>Changes</h2>
            <p>We may update these terms; continued use after changes constitutes acceptance where permitted by law.</p>

            <h2>Contact</h2>
            <p>
              Questions about these terms:{" "}
              <a href="mailto:hello@ktmapartments.com">hello@ktmapartments.com</a> or{" "}
              <a href="/contact">contact page</a>.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
