import { describe, expect, test } from "@jest/globals";
import { rankFindings } from "../../performance/helpers/auditScoring";

describe("rankFindings", () => {
  test("orders high-impact high-confidence findings first", () => {
    const ranked = rankFindings([
      { id: "a", impact: "low", confidence: "high", effort: "S", metricValue: 400 },
      { id: "b", impact: "high", confidence: "high", effort: "M", metricValue: 1200 },
    ]);

    expect(ranked[0].id).toBe("b");
  });

  test("applies confidence and effort weighting when impact matches", () => {
    const ranked = rankFindings([
      { id: "medium-confidence-small-effort", impact: "high", confidence: "medium", effort: "S", metricValue: 1000 },
      { id: "high-confidence-large-effort", impact: "high", confidence: "high", effort: "L", metricValue: 3000 },
    ]);

    expect(ranked.map((finding) => finding.id)).toEqual([
      "medium-confidence-small-effort",
      "high-confidence-large-effort",
    ]);
  });

  test("uses metricValue as tie-breaker for equal weighted scores", () => {
    const ranked = rankFindings([
      { id: "lower-metric", impact: "medium", confidence: "medium", effort: "M", metricValue: 500 },
      { id: "higher-metric", impact: "medium", confidence: "medium", effort: "M", metricValue: 900 },
    ]);

    expect(ranked.map((finding) => finding.id)).toEqual(["higher-metric", "lower-metric"]);
  });

  test("does not mutate the input array", () => {
    const findings = [
      { id: "first", impact: "low", confidence: "high", effort: "S", metricValue: 400 },
      { id: "second", impact: "high", confidence: "high", effort: "M", metricValue: 1200 },
    ] as const;
    const originalOrder = findings.map((finding) => finding.id);

    const ranked = rankFindings(findings);

    expect(ranked.map((finding) => finding.id)).toEqual(["second", "first"]);
    expect(findings.map((finding) => finding.id)).toEqual(originalOrder);
  });
});
