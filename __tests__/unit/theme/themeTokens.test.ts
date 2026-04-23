import { themeTokens } from "@/lib/theme/tokens";

describe("themeTokens", () => {
  it("exposes required semantic color token keys", () => {
    expect(themeTokens.color.background).toBeDefined();
    expect(themeTokens.color.surface).toBeDefined();
    expect(themeTokens.color.textPrimary).toBeDefined();
    expect(themeTokens.color.primary).toBeDefined();
    expect(themeTokens.color.focusRing).toBeDefined();
  });
});
