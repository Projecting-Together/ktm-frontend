"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, X } from "lucide-react";
import { cn, KTM_NEIGHBORHOODS, buildSearchUrl } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  defaultLocation?: string;
  size?: "sm" | "lg";
  className?: string;
  onSearch?: (query: string, location: string) => void;
}

export function SearchBar({
  defaultValue = "",
  defaultLocation = "",
  size = "lg",
  className,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [location, setLocation] = useState(defaultLocation);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredNeighborhoods = KTM_NEIGHBORHOODS.filter(
    (n) =>
      location.length === 0 ||
      n.name.toLowerCase().includes(location.toLowerCase()) ||
      n.name_ne.includes(location)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: Record<string, string> = {};
    if (query.trim().length >= 2) filters.search = query.trim();
    if (location.trim()) filters.neighborhood = location.trim().toLowerCase();
    if (onSearch) {
      onSearch(query, location);
    } else {
      router.push(buildSearchUrl(filters));
    }
    setShowSuggestions(false);
  };

  const selectNeighborhood = (slug: string, name: string) => {
    setLocation(name);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  if (size === "sm") {
    return (
      <form onSubmit={handleSubmit} className={cn("flex items-center gap-2", className)}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
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
        "flex flex-col overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border sm:flex-row",
        className
      )}
    >
      {/* Location input */}
      <div className="relative flex-1 border-b border-border sm:border-b-0 sm:border-r">
        <div className="flex items-center gap-3 px-4 py-3">
          <MapPin className="h-5 w-5 shrink-0 text-accent" />
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Thamel, Lazimpat, Patan..."
              className="mt-0.5 w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
          {location && (
            <button
              type="button"
              onClick={() => setLocation("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Neighborhood suggestions */}
        {showSuggestions && filteredNeighborhoods.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-[600] rounded-b-xl border border-t-0 border-border bg-card shadow-lg">
            {filteredNeighborhoods.slice(0, 6).map((n) => (
              <button
                key={n.slug}
                type="button"
                onMouseDown={() => selectNeighborhood(n.slug, n.name)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="font-medium">{n.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{n.name_ne}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Keyword search */}
      <div className="flex flex-1 items-center gap-3 px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-accent" />
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Search
          </label>
          <input
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
