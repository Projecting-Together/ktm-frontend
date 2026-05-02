import Link from "next/link";
import { Building2, Phone, Mail, MapPin } from "lucide-react";

const FOOTER_LINKS = {
  Explore: [
    { href: "/listings", label: "Listings" },
    { href: "/news", label: "News" },
  ],
  Account: [
    { href: "/dashboard", label: "My Dashboard" },
    { href: "/dashboard/favorites", label: "Saved Listings" },
    { href: "/dashboard/inquiries", label: "My Inquiries" },
    { href: "/manage/listings/new", label: "Post a Listing" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        {/* Top section */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Building2 className="h-6 w-6 text-accent" />
              <span className="text-lg" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
                KTM<span className="text-accent">Apartments</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-primary-foreground/70">
              Nepal&apos;s premier property discovery platform. Find verified apartments and rooms across Kathmandu.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-primary-foreground/70">
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                Kathmandu, Nepal
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-accent" />
                +977 01-XXXXXXX
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-accent" />
                hello@ktmapartments.com
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-semibold text-primary-foreground">
                {title}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/50 sm:flex-row">
          <p>© {new Date().getFullYear()} KTM Apartments. All rights reserved.</p>
          <p>Built with ❤️ for Kathmandu</p>
        </div>
      </div>
    </footer>
  );
}
