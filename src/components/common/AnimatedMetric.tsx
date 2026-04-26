"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const [displayValue, setDisplayValue] = useState(value);
  const hasMountedRef = useRef(false);
  const displayValueRef = useRef(value);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      setDisplayValue(value);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || durationMs <= 0) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValueRef.current;
    const startedAt = performance.now();
    let frameId = 0;

    const tick = (timestamp: number) => {
      const elapsed = timestamp - startedAt;
      const progress = Math.min(1, elapsed / durationMs);
      const nextValue = startValue + (value - startValue) * progress;
      setDisplayValue(Math.round(nextValue));
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
