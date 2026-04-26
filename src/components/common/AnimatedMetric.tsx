"use client";

import { useEffect, useMemo, useState } from "react";

type AnimatedMetricProps = {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
  "data-testid"?: string;
};

function formatMetric(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.floor(value)));
}

export function AnimatedMetric({
  value,
  suffix = "",
  durationMs = 900,
  className,
  "data-testid": dataTestId,
}: AnimatedMetricProps) {
  const [displayValue, setDisplayValue] = useState(() => (typeof window === "undefined" ? value : 0));

  useEffect(() => {
    if (typeof window === "undefined") {
      setDisplayValue(value);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || durationMs <= 0) {
      setDisplayValue(value);
      return;
    }

    const startedAt = performance.now();
    let frameId = 0;

    const tick = (timestamp: number) => {
      const elapsed = timestamp - startedAt;
      const progress = Math.min(1, elapsed / durationMs);
      setDisplayValue(Math.round(value * progress));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [durationMs, value]);

  const formattedValue = useMemo(() => formatMetric(displayValue), [displayValue]);

  return (
    <span aria-live="polite" data-testid={dataTestId} className={className}>
      {formattedValue}
      {suffix}
    </span>
  );
}
