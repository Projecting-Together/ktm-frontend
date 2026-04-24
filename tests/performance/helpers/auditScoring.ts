export type Impact = "high" | "medium" | "low";
export type Confidence = "high" | "medium" | "low";
export type Effort = "S" | "M" | "L";

export interface AuditFinding {
  id: string;
  impact: Impact;
  confidence: Confidence;
  effort: Effort;
  metricValue: number;
}

const IMPACT_SCORE: Record<Impact, number> = { high: 3, medium: 2, low: 1 };
const CONFIDENCE_SCORE: Record<Confidence, number> = { high: 3, medium: 2, low: 1 };
const EFFORT_SCORE: Record<Effort, number> = { S: 3, M: 2, L: 1 };

export function rankFindings(findings: ReadonlyArray<AuditFinding>): AuditFinding[] {
  return [...findings].sort((a, b) => {
    const scoreA = IMPACT_SCORE[a.impact] * CONFIDENCE_SCORE[a.confidence] * EFFORT_SCORE[a.effort];
    const scoreB = IMPACT_SCORE[b.impact] * CONFIDENCE_SCORE[b.confidence] * EFFORT_SCORE[b.effort];
    return scoreB - scoreA || b.metricValue - a.metricValue;
  });
}
