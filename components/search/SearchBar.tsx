"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn, buildSearchUrl } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  size?: "sm" | "lg";
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  defaultValue = "",
  size = "lg",
  className,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const keywordInputId = size === "sm" ? "search-keyword-sm" : "search-keyword-lg";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedQuery = query.trim();
    const activeQuery = normalizedQuery.length >= 2 ? normalizedQuery : "";
    const filters: Record<string, string> = {};
    if (activeQuery) filters.search = activeQuery;
    if (onSearch) {
      onSearch(activeQuery);
    } else {
      router.push(buildSearchUrl(filters));
    }
  };

  if (size === "sm") {
    return (
      <form onSubmit={handleSubmit} className={cn("flex items-center gap-2", className)}>
        <div className="relative flex-1">
          <label htmlFor={keywordInputId} className="sr-only">
            Search
          </label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id={keywordInputId}
            aria-label="Search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apartments..."
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button type="submit" className="btn-primary h-9 px-4 text-xs">
          Search
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-3 px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-accent" />
        <div className="flex-1">
          <label htmlFor={keywordInputId} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Search
          </label>
          <input
            id={keywordInputId}
            aria-label="Search"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="2 bed apartment, studio..."
            className="mt-0.5 w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center p-2">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent/90 active:scale-95 sm:w-auto"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
        </button>
      </div>
    </form>
  );
}
