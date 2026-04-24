import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import type { TestInfo } from "@playwright/test";
import type { Confidence, Effort, Impact } from "./auditScoring";

export interface PerfSnapshot {
  testName: string;
  mode: "mocked" | "real";
  route: string;
  auditPhase?: "search_flow" | "auth_manage" | "global_assets";
  metrics: Record<string, number>;
  budgets: Array<{ name: string; threshold: number; actual: number; pass: boolean }>;
  requestCounts: Record<string, number>;
  findings?: Array<{
    id: string;
    title: string;
    impact: Impact;
    confidence: Confidence;
    effort: Effort;
    metricValue: number;
    action: string;
  }>;
  dataFlow?: {
    endpointAvgMs?: Record<string, number>;
    endpointMaxMs?: Record<string, number>;
    endpointCount?: Record<string, number>;
    duplicateRequestKeys?: Array<{ key: string; count: number }>;
    phaseTimingsMs?: Record<string, number>;
  };
  notes?: string[];
}

export async function writePerfSnapshot(testInfo: TestInfo, snapshot: PerfSnapshot): Promise<void> {
  const dir = join(process.cwd(), "build", "performance", "snapshots");
  await mkdir(dir, { recursive: true });
  const safeTitle = testInfo.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const randomSuffix = randomBytes(3).toString("hex");
  const file = join(dir, `${safeTitle}-${Date.now()}-${randomSuffix}.json`);
  await writeFile(file, JSON.stringify(snapshot, null, 2), "utf8");
  await testInfo.attach("perf-snapshot", {
    body: Buffer.from(JSON.stringify(snapshot, null, 2), "utf8"),
    contentType: "application/json",
  });
}

export async function measureActionMs(action: () => Promise<void>): Promise<number> {
  const startedAt = performance.now();
  await action();
  return performance.now() - startedAt;
}
