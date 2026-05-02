import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact KTM Apartments",
  description: "Contact KTM Apartments for listing support, partnerships, and platform assistance.",
};

const SUPPORT_EMAIL = "hello@ktmapartments.com";

export default function ContactPage() {
  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("KTM Apartments inquiry")}`;

  return (
    <main className="bg-background">
      <section className="border-b border-border bg-card">
        <div className="container py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Contact</p>
          <h1 className="mt-2">We&apos;re Here to Help</h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            Send us a message below, email us directly, or reach us by phone during Kathmandu business hours.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <aside className="space-y-5 lg:col-span-5">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold">Email</h2>
              <a
                href={mailtoHref}
                className="mt-2 inline-flex items-center gap-2 text-lg font-medium text-accent hover:underline"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                {SUPPORT_EMAIL}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                Opens your mail app with our address filled in if you prefer not to use the form.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold">Phone</h2>
              <p className="mt-2 flex items-center gap-2 text-lg font-medium text-foreground">
                <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                +977 01-XXXXXXX
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Standard Kathmandu business hours.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold">Office</h2>
              <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                Kathmandu, Nepal — local operations and verification support.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Form submissions are processed by our server and reviewed by the team. Read how we handle data in our{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
