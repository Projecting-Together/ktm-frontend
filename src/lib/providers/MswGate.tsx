"use client";

import { useEffect, useState } from "react";

/**
 * When `NEXT_PUBLIC_USE_MSW=true`, loads MSW in the browser before rendering app content
 * so all `fetch` calls to `NEXT_PUBLIC_API_URL` are served by mock handlers.
 */
export function MswGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(() => process.env.NEXT_PUBLIC_USE_MSW !== "true");

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MSW !== "true") return;
    let cancelled = false;
    void import("@/msw/startBrowserWorker")
      .then(({ startMsw }) => startMsw())
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        console.error("[MSW] Failed to start mock worker:", err);
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <p>Starting mock API…</p>
      </div>
    );
  }
  return <>{children}</>;
}
