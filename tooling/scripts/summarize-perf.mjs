import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const snapshotsDir = join(process.cwd(), "build", "performance", "snapshots");
const outputDir = join(process.cwd(), "build", "performance");
const outputFile = join(outputDir, "summary.json");
const outputMarkdownFile = join(outputDir, "summary.md");

async function listSnapshotFiles() {
  try {
    const entries = await readdir(snapshotsDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => join(snapshotsDir, entry.name));
  } catch {
    return [];
  }
}

function getModeSummary(mode, snapshots) {
  const modeSnapshots = snapshots.filter((snapshot) => snapshot.mode === mode);
  const budgets = modeSnapshots.flatMap((snapshot) => snapshot.budgets ?? []);
  const passedBudgets = budgets.filter((budget) => budget.pass).length;
  const failedBudgets = budgets.length - passedBudgets;

  return {
    mode,
    tests: modeSnapshots.length,
    budgets: {
      total: budgets.length,
      passed: passedBudgets,
      failed: failedBudgets,
    },
    averageMetrics: computeAverageMetrics(modeSnapshots),
  };
}

function computeAverageMetrics(snapshots) {
  const sums = new Map();
  const counts = new Map();

  for (const snapshot of snapshots) {
    for (const [name, value] of Object.entries(snapshot.metrics ?? {})) {
      if (typeof value !== "number" || !Number.isFinite(value)) continue;
      sums.set(name, (sums.get(name) ?? 0) + value);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }

  const result = {};
  for (const [name, sum] of sums.entries()) {
    const count = counts.get(name) ?? 1;
    result[name] = Number((sum / count).toFixed(2));
  }
  return result;
}

async function main() {
  const files = await listSnapshotFiles();
  const snapshots = [];

  for (const file of files) {
    try {
      const raw = await readFile(file, "utf8");
      snapshots.push(JSON.parse(raw));
    } catch {
      // Ignore malformed snapshots so one bad file doesn't block report generation.
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    totalSnapshots: snapshots.length,
    modes: [
      getModeSummary("mocked", snapshots),
      getModeSummary("real", snapshots),
    ],
    hotspots: buildHotspots(snapshots),
    snapshots,
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, JSON.stringify(summary, null, 2), "utf8");
  await writeFile(outputMarkdownFile, toMarkdownSummary(summary), "utf8");

  console.log(`Performance summary written: ${outputFile}`);
  console.log(`Performance markdown summary written: ${outputMarkdownFile}`);
}

function toMarkdownSummary(summary) {
  const lines = [];
  lines.push("# Performance Summary");
  lines.push("");
  lines.push(`- Generated: ${summary.generatedAt}`);
  lines.push(`- Total snapshots: ${summary.totalSnapshots}`);
  lines.push("");

  for (const modeSummary of summary.modes) {
    lines.push(`## ${modeSummary.mode.toUpperCase()} Mode`);
    lines.push("");
    lines.push(`- Tests: ${modeSummary.tests}`);
    lines.push(`- Budgets: ${modeSummary.budgets.passed}/${modeSummary.budgets.total} passed`);
    lines.push(`- Failed budgets: ${modeSummary.budgets.failed}`);
    lines.push("");

    const metricEntries = Object.entries(modeSummary.averageMetrics ?? {});
    if (metricEntries.length > 0) {
      lines.push("### Average Metrics");
      lines.push("");
      for (const [metric, value] of metricEntries) {
        lines.push(`- ${metric}: ${value}`);
      }
      lines.push("");
    }
  }

  lines.push("## Hotspots");
  lines.push("");
  lines.push(`- Slowest endpoint (avg): ${summary.hotspots.slowestEndpointAvg?.endpoint ?? "n/a"} (${summary.hotspots.slowestEndpointAvg?.ms ?? "n/a"} ms)`);
  lines.push(`- Slowest endpoint (max): ${summary.hotspots.slowestEndpointMax?.endpoint ?? "n/a"} (${summary.hotspots.slowestEndpointMax?.ms ?? "n/a"} ms)`);
  lines.push(`- Most duplicated request key: ${summary.hotspots.mostDuplicatedRequest?.key ?? "n/a"} (${summary.hotspots.mostDuplicatedRequest?.count ?? "n/a"})`);
  lines.push(`- Slowest phase: ${summary.hotspots.slowestPhase?.phase ?? "n/a"} (${summary.hotspots.slowestPhase?.ms ?? "n/a"} ms)`);
  lines.push("");

  const topDupes = buildTopDuplicateRequests(summary.snapshots, 5);
  lines.push("## Top Duplicate Request Keys");
  lines.push("");
  if (topDupes.length === 0) {
    lines.push("- n/a");
  } else {
    for (const item of topDupes) {
      lines.push(`- ${item.key}: ${item.count}`);
    }
  }
  lines.push("");

  const endpointRows = buildEndpointTimingRows(summary.snapshots);
  lines.push("## Endpoint Timing Table");
  lines.push("");
  if (endpointRows.length === 0) {
    lines.push("- n/a");
    lines.push("");
  } else {
    lines.push("| Endpoint | Avg ms | Max ms | Count |");
    lines.push("|---|---:|---:|---:|");
    for (const row of endpointRows) {
      lines.push(`| ${escapeMarkdownCell(row.endpoint)} | ${row.avgMs} | ${row.maxMs} | ${row.count} |`);
    }
    lines.push("");
  }

  const apiEndpointRows = buildEndpointTimingRows(summary.snapshots, { apiOnly: true });
  lines.push("## API Endpoint Timing Table");
  lines.push("");
  if (apiEndpointRows.length === 0) {
    lines.push("- n/a");
    lines.push("");
  } else {
    lines.push("| Endpoint | Avg ms | Max ms | Count |");
    lines.push("|---|---:|---:|---:|");
    for (const row of apiEndpointRows) {
      lines.push(`| ${escapeMarkdownCell(row.endpoint)} | ${row.avgMs} | ${row.maxMs} | ${row.count} |`);
    }
    lines.push("");
  }

  const globalAssetRows = buildEndpointTimingRows(summary.snapshots, { globalAssetsOnly: true });
  lines.push("## Global Assets Timing Table");
  lines.push("");
  if (globalAssetRows.length === 0) {
    lines.push("- n/a");
    lines.push("");
  } else {
    lines.push("| Endpoint | Avg ms | Max ms | Count |");
    lines.push("|---|---:|---:|---:|");
    for (const row of globalAssetRows) {
      lines.push(`| ${escapeMarkdownCell(row.endpoint)} | ${row.avgMs} | ${row.maxMs} | ${row.count} |`);
    }
    lines.push("");
  }

  const rankedFindings = buildRankedBottleneckFindings(summary.snapshots);
  lines.push("## Ranked Bottleneck Findings");
  lines.push("");
  if (rankedFindings.length === 0) {
    lines.push("- n/a");
  } else {
    lines.push("| Rank | Score | Finding | Impact | Confidence | Effort | Metric | Source | Action |");
    lines.push("|---:|---:|---|---|---|---|---:|---|---|");
    for (let index = 0; index < rankedFindings.length; index += 1) {
      const item = rankedFindings[index];
      const metricValue = Number.isFinite(item.metricValue) ? Number(item.metricValue.toFixed(2)) : 0;
      lines.push(
        `| ${index + 1} | ${item.score} | ${escapeMarkdownCell(item.title)} | ${escapeMarkdownCell(item.impact)} | ${escapeMarkdownCell(item.confidence)} | ${escapeMarkdownCell(item.effort)} | ${metricValue} | ${escapeMarkdownCell(item.source)} | ${escapeMarkdownCell(item.action)} |`,
      );
    }
  }
  lines.push("");

  lines.push("## Snapshot Files");
  lines.push("");
  for (const snapshot of summary.snapshots) {
    lines.push(`- ${snapshot.testName} (${snapshot.mode})`);
  }
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function buildHotspots(snapshots) {
  const endpointAvg = new Map();
  const endpointMax = new Map();
  const dupKeyMax = new Map();
  const phaseMax = new Map();

  for (const snapshot of snapshots) {
    const flow = snapshot.dataFlow ?? {};
    for (const [endpoint, ms] of Object.entries(flow.endpointAvgMs ?? {})) {
      endpointAvg.set(endpoint, Math.max(endpointAvg.get(endpoint) ?? 0, ms));
    }
    for (const [endpoint, ms] of Object.entries(flow.endpointMaxMs ?? {})) {
      endpointMax.set(endpoint, Math.max(endpointMax.get(endpoint) ?? 0, ms));
    }
    for (const item of flow.duplicateRequestKeys ?? []) {
      dupKeyMax.set(item.key, Math.max(dupKeyMax.get(item.key) ?? 0, item.count));
    }
    for (const [phase, ms] of Object.entries(flow.phaseTimingsMs ?? {})) {
      phaseMax.set(phase, Math.max(phaseMax.get(phase) ?? 0, ms));
    }
  }

  const slowestEndpointAvg = topEntry(endpointAvg);
  const slowestEndpointMax = topEntry(endpointMax);
  const mostDuplicatedRequest = topEntry(dupKeyMax);
  const slowestPhase = topEntry(phaseMax);

  return {
    slowestEndpointAvg: slowestEndpointAvg ? { endpoint: slowestEndpointAvg.key, ms: Number(slowestEndpointAvg.value.toFixed(2)) } : null,
    slowestEndpointMax: slowestEndpointMax ? { endpoint: slowestEndpointMax.key, ms: Number(slowestEndpointMax.value.toFixed(2)) } : null,
    mostDuplicatedRequest: mostDuplicatedRequest ? { key: mostDuplicatedRequest.key, count: mostDuplicatedRequest.value } : null,
    slowestPhase: slowestPhase ? { phase: slowestPhase.key, ms: Number(slowestPhase.value.toFixed(2)) } : null,
  };
}

function topEntry(map) {
  let best = null;
  for (const [key, value] of map.entries()) {
    if (best == null || value > best.value) {
      best = { key, value };
    }
  }
  return best;
}

function buildTopDuplicateRequests(snapshots, limit) {
  const aggregate = new Map();
  for (const snapshot of snapshots) {
    for (const item of snapshot?.dataFlow?.duplicateRequestKeys ?? []) {
      aggregate.set(item.key, Math.max(aggregate.get(item.key) ?? 0, item.count));
    }
  }
  return [...aggregate.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function isApiEndpoint(endpoint) {
  return endpoint.startsWith("/api/");
}

function isGlobalAssetEndpoint(endpoint) {
  if (typeof endpoint !== "string" || endpoint.length === 0) return false;
  if (endpoint.startsWith("/_next/")) return true;
  if (endpoint.startsWith("/_next/image")) return true;
  if (endpoint.includes("/fonts/")) return true;
  if (endpoint.includes("/font/")) return true;
  if (endpoint.includes("/css/")) return true;
  return /\.(?:js|css|woff2?|png|jpe?g|svg|webp|gif)(?:\?.*)?$/i.test(endpoint);
}

function escapeMarkdownCell(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("|", "\\|")
    .replaceAll("\n", "<br>");
}

function buildEndpointTimingRows(snapshots, options = {}) {
  const { apiOnly = false, globalAssetsOnly = false } = options;
  const rows = new Map();
  for (const snapshot of snapshots) {
    const avg = snapshot?.dataFlow?.endpointAvgMs ?? {};
    const max = snapshot?.dataFlow?.endpointMaxMs ?? {};
    const counts = snapshot?.dataFlow?.endpointCount ?? {};

    for (const endpoint of new Set([...Object.keys(avg), ...Object.keys(max), ...Object.keys(counts)])) {
      if (apiOnly && !isApiEndpoint(endpoint)) {
        continue;
      }
      if (globalAssetsOnly && !isGlobalAssetEndpoint(endpoint)) {
        continue;
      }
      const current = rows.get(endpoint) ?? { avgMsSum: 0, avgMsCount: 0, maxMs: 0, count: 0 };
      const avgMs = Number(avg[endpoint]);
      if (Number.isFinite(avgMs)) {
        current.avgMsSum += avgMs;
        current.avgMsCount += 1;
      }
      current.maxMs = Math.max(current.maxMs, Number(max[endpoint] ?? 0));
      const endpointCount = Number(counts[endpoint]);
      if (Number.isFinite(endpointCount)) {
        current.count += endpointCount;
      }
      rows.set(endpoint, current);
    }
  }

  return [...rows.entries()]
    .map(([endpoint, values]) => ({
      endpoint,
      avgMs: Number(((values.avgMsCount === 0 ? 0 : values.avgMsSum / values.avgMsCount)).toFixed(2)),
      maxMs: Number(values.maxMs.toFixed(2)),
      count: values.count,
    }))
    .sort((a, b) => b.avgMs - a.avgMs);
}

const IMPACT_SCORE = { high: 3, medium: 2, low: 1 };
const CONFIDENCE_SCORE = { high: 3, medium: 2, low: 1 };
const EFFORT_SCORE = { S: 3, M: 2, L: 1 };

function buildRankedBottleneckFindings(snapshots) {
  const rows = [];
  for (const snapshot of snapshots) {
    for (const finding of snapshot.findings ?? []) {
      const impact = finding?.impact ?? "low";
      const confidence = finding?.confidence ?? "low";
      const effort = finding?.effort ?? "L";
      const metricValue = Number(finding?.metricValue ?? 0);
      const score = (IMPACT_SCORE[impact] ?? 1) * (CONFIDENCE_SCORE[confidence] ?? 1) * (EFFORT_SCORE[effort] ?? 1);
      rows.push({
        id: finding?.id ?? "unknown",
        title: finding?.title ?? finding?.id ?? "Unknown finding",
        action: finding?.action ?? "n/a",
        impact,
        confidence,
        effort,
        metricValue: Number.isFinite(metricValue) ? metricValue : 0,
        score,
        source: `${snapshot.testName ?? "unknown"} (${snapshot.auditPhase ?? "unassigned"})`,
      });
    }
  }

  return rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.metricValue !== a.metricValue) return b.metricValue - a.metricValue;
    return a.title.localeCompare(b.title);
  });
}

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMainModule) {
  await main();
}

export {
  buildEndpointTimingRows,
  buildRankedBottleneckFindings,
  isApiEndpoint,
  isGlobalAssetEndpoint,
  toMarkdownSummary,
};
