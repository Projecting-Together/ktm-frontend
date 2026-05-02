"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { buildSearchUrl, cn } from "@/lib/utils";

type PurposeMode = "rent" | "sale";

export function HomeHeroSearch() {
  const router = useRouter();
  const [purpose, setPurpose] = useState<PurposeMode>("rent");

  const handleSearch = (query: string) => {
    const filters: Record<string, string> = {
      purpose: purpose === "sale" ? "sale" : "rent",
    };
    if (query.length >= 2) filters.search = query;
    router.push(buildSearchUrl(filters));
  };

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <SearchBar size="lg" onSearch={handleSearch} />
      <div
        className="mt-4 flex justify-center"
        role="group"
        aria-label="Listing purpose"
      >
        <div className="inline-flex rounded-lg border border-white/25 bg-black/20 p-0.5 backdrop-blur-sm">
          {(
            [
              { value: "rent" as const, label: "Rent" },
              { value: "sale" as const, label: "Buy" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPurpose(option.value)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                purpose === option.value
                  ? "bg-white text-primary shadow-sm"
                  : "text-primary-foreground/90 hover:bg-white/10",
              )}
              aria-pressed={purpose === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
