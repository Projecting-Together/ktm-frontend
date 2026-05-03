"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logger } from "@/lib/observability/logger";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error("global-error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", maxWidth: "24rem" }}>
          A critical error occurred. Please refresh the page or try again.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              background: "#1d4ed8",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
