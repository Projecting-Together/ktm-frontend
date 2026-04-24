import type { Metadata } from "next";
import Link from "next/link";
import { getNews } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "Latest News | KTM Apartments",
  description: "Read housing, rental, and neighborhood updates from KTM Apartments.",
};

export const revalidate = 60;

export default async function PublicNewsPage() {
  const result = await getNews({ page: 1, limit: 12 });
  const items = result.data?.items ?? [];

  return (
    <main className="container py-10">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Market Updates</p>
        <h1 className="mt-2">Latest News</h1>
        <p className="mt-3 text-muted-foreground">Published stories and local insights for renters, owners, and agents.</p>
      </div>

      {!items.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <h2 className="text-lg font-semibold">No published news yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Please check back soon for fresh Kathmandu market updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.published_at ? new Date(item.published_at).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Published"}
              </p>
              <h2 className="mt-2 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.summary ?? "Read the full story for more details."}</p>
              <Link href={`/news/${item.slug}`} className="mt-4 inline-flex text-sm font-medium text-accent hover:underline">
                Read article
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
