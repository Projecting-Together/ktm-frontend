import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getNewsDetail } from "@/lib/api/client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getNewsDetail(slug);

  if (!result.data) {
    return {
      title: "News Not Found | KTM Apartments",
      description: "The requested news article was not found.",
    };
  }

  return {
    title: `${result.data.title} | KTM Apartments`,
    description: result.data.summary ?? "KTM Apartments market news and updates.",
  };
}

export const revalidate = 60;

export default async function PublicNewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getNewsDetail(slug);

  if (!result.data) {
    notFound();
  }

  return (
    <main className="container py-10">
      <Link href="/news" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" />
        Back to news
      </Link>

      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {result.data.published_at
            ? new Date(result.data.published_at).toLocaleDateString("en-US", { dateStyle: "medium" })
            : "Published"}
        </p>
        <h1 className="mt-2">{result.data.title}</h1>
        {result.data.summary ? <p className="mt-3 text-muted-foreground">{result.data.summary}</p> : null}
        <div className="prose prose-neutral mt-6 max-w-none text-foreground">
          <p>{result.data.content ?? "Article details are not available right now."}</p>
        </div>
      </article>
    </main>
  );
}
