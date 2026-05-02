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
  const [displayValue, setDisplayValue] = useState(0);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const displayValueRef = useRef(0);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        obs.disconnect();
        setInView(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

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
  }, [inView, durationMs, value]);

  const shown = inView ? displayValue : 0;
  const formattedValue = useMemo(() => formatMetric(shown), [shown]);

  return (
    <span ref={rootRef} aria-live="polite" data-testid={dataTestId} className={className}>
      {formattedValue}
      {suffix}
    </span>
  );
}
