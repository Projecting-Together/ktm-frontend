"use client";

import { useEffect } from "react";
import { logger } from "@/lib/observability/logger";
import { trackClientError } from "@/lib/observability/analytics";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    logger.error("route-error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
    trackClientError({
      message: error.message,
      source: "route-error-boundary",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl font-bold text-destructive">!</span>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred. You can try again or return to the home page.
        </p>
        {process.env.NODE_ENV !== "production" && error.digest && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Digest: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
