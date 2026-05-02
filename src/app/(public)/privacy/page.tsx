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
            This policy describes how KTM Apartments (“we”, “us”) handles personal information when you use our website
            and related services in Nepal.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-3xl">
          <article className="prose prose-neutral max-w-none text-foreground prose-headings:font-semibold prose-a:text-accent">
            <p className="text-sm text-muted-foreground not-prose">
              Last updated: May 2026. This page is provided for transparency; it does not constitute legal advice.
            </p>

            <h2>Who we are</h2>
            <p>
              KTM Apartments operates an online property discovery platform focused on Kathmandu and surrounding areas. If
              you contact us or create an account, we process certain information to provide and improve the service.
            </p>

            <h2>Information we collect</h2>
            <ul>
              <li>
                <strong>Account data:</strong> email address and credentials when you register or sign in.
              </li>
              <li>
                <strong>Listing and inquiry data:</strong> content you submit when posting or contacting owners or our
                team (e.g. messages, phone numbers you choose to share).
              </li>
              <li>
                <strong>Technical data:</strong> IP address, device/browser type, approximate region, and logs used for
                security, debugging, and aggregate analytics.
              </li>
              <li>
                <strong>Cookies and similar technologies:</strong> used where necessary for authentication, preferences,
                and basic usage measurement. You can control cookies through your browser settings.
              </li>
            </ul>

            <h2>How we use information</h2>
            <p>We use personal information to:</p>
            <ul>
              <li>Operate accounts, listings, search, favorites, and messaging features;</li>
              <li>Verify listings and reduce fraud or abuse;</li>
              <li>Respond to support requests and legal obligations;</li>
              <li>Improve reliability and performance of the platform.</li>
            </ul>
            <p>
              We do not sell your personal information to third parties. We may share data with service providers who
              host infrastructure or analytics under agreements that limit use to providing services to us.
            </p>

            <h2>Retention</h2>
            <p>
              We retain information only as long as needed for the purposes above, including legal, accounting, or
              dispute requirements. Listing and message retention may vary by feature and applicable law.
            </p>

            <h2>Your choices</h2>
            <ul>
              <li>Update profile or listing information through your account where available.</li>
              <li>Request account closure or deletion by contacting us; some records may be retained where required by law.</li>
              <li>Opt out of non-essential cookies where our cookie banner or settings allow.</li>
            </ul>

            <h2>Security</h2>
            <p>
              We apply reasonable technical and organizational measures to protect data. No method of transmission over
              the internet is completely secure; use strong passwords and protect your credentials.
            </p>

            <h2>Children</h2>
            <p>
              Our services are not directed at children under the minimum age for entering contracts in your jurisdiction.
              If you believe we have collected a child&apos;s data in error, contact us for removal.
            </p>

            <h2>International transfers</h2>
            <p>
              Data may be processed in Nepal or on infrastructure located abroad by subprocessors. Where required, we take
              steps to ensure appropriate safeguards.
            </p>

            <h2>Changes</h2>
            <p>
              We may update this policy from time to time. Material changes will be indicated by updating the date above
              or through notices on the platform where appropriate.
            </p>

            <h2>Contact</h2>
            <p>
              For privacy-related requests, email{" "}
              <a href="mailto:hello@ktmapartments.com">hello@ktmapartments.com</a> or use our{" "}
              <a href="/contact">contact page</a>.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
