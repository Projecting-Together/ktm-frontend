import { getGlobalMswEnabled, resolveScenarioState } from "@/msw/mockScenarioSelector";

describe("mockScenarioSelector", () => {
  describe("resolveScenarioState", () => {
    it("returns happy by default", () => {
      expect(resolveScenarioState(undefined)).toBe("happy");
    });

    it("falls back to happy for unknown state", () => {
      expect(resolveScenarioState("unknown")).toBe("happy");
    });

    it("keeps valid state values unchanged", () => {
      expect(resolveScenarioState("happy")).toBe("happy");
      expect(resolveScenarioState("empty")).toBe("empty");
      expect(resolveScenarioState("error")).toBe("error");
      expect(resolveScenarioState("partial")).toBe("partial");
      expect(resolveScenarioState("permission")).toBe("permission");
      expect(resolveScenarioState("stress")).toBe("stress");
    });
  });

  describe("getGlobalMswEnabled", () => {
    const originalFlag = process.env.NEXT_PUBLIC_USE_MSW;

    afterEach(() => {
      if (originalFlag === undefined) {
        delete process.env.NEXT_PUBLIC_USE_MSW;
        return;
      }
      process.env.NEXT_PUBLIC_USE_MSW = originalFlag;
    });

    it("returns true only when NEXT_PUBLIC_USE_MSW is true", () => {
      process.env.NEXT_PUBLIC_USE_MSW = "true";
      expect(getGlobalMswEnabled()).toBe(true);

      process.env.NEXT_PUBLIC_USE_MSW = "false";
      expect(getGlobalMswEnabled()).toBe(false);

      delete process.env.NEXT_PUBLIC_USE_MSW;
      expect(getGlobalMswEnabled()).toBe(false);
    });
  });
});
