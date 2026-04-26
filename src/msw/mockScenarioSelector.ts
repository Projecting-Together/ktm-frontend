import type { ScenarioState } from "./mockScenarioData";

const VALID_SCENARIO_STATES: ReadonlySet<ScenarioState> = new Set([
  "happy",
  "empty",
  "error",
  "partial",
  "permission",
  "stress",
]);

export function resolveScenarioState(input: string | undefined): ScenarioState {
  if (!input || !VALID_SCENARIO_STATES.has(input as ScenarioState)) {
    return "happy";
  }

  return input as ScenarioState;
}

export function getGlobalMswEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MSW === "true";
}
