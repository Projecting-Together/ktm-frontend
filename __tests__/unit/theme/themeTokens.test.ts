import { themeTokens } from "@/lib/theme/tokens";
import { applyThemeVariables } from "@/lib/theme/applyTheme";

describe("themeTokens", () => {
  it("exposes the exact semantic color token keys", () => {
    expect(Object.keys(themeTokens.color)).toEqual([
      "background",
      "surface",
      "surfaceMuted",
      "textPrimary",
      "textSecondary",
      "border",
      "primary",
      "primaryForeground",
      "accent",
      "success",
      "warning",
      "danger",
      "focusRing",
    ]);
  });

  it("formats semantic tokens as CSS variable declarations", () => {
    const cssVariables = applyThemeVariables();

    expect(cssVariables).toContain("--color-background: #FAF8F4;");
    expect(cssVariables).toContain("--color-surface: #FFFFFF;");
    expect(cssVariables).toContain("--color-textPrimary: #0F2744;");
    expect(cssVariables).toContain("--color-primary: #0F2744;");
    expect(cssVariables).toContain("--color-focusRing: #E85D25;");

    const lines = cssVariables.split("\n");
    expect(lines).toHaveLength(Object.keys(themeTokens.color).length);
    expect(lines.every((line) => /^--color-[a-zA-Z]+:\s+#[0-9A-Fa-f]{6};$/.test(line))).toBe(true);
  });
});
