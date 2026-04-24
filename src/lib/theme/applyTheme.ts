import { themeTokens } from "@/lib/theme/tokens";

export function applyThemeVariables(): string {
  return Object.entries(themeTokens.color)
    .map(([key, value]) => `--color-${key}: ${value};`)
    .join("\n");
}
