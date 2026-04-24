import { formatPrice, formatRelativeTime, formatDate, slugify } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats NPR price with comma separators", () => {
    const result = formatPrice(28000, "NPR");
    expect(result).toContain("28,000");
    expect(result).toContain("NPR");
  });

  it("handles zero price", () => {
    const result = formatPrice(0, "NPR");
    expect(result).toContain("0");
  });

  it("appends period suffix when provided", () => {
    const result = formatPrice(28000, "NPR", "monthly");
    expect(result).toContain("28,000");
    expect(result).toContain("monthly");
  });

  it("returns Price on request for null", () => {
    expect(formatPrice(null)).toBe("Price on request");
  });

  it("returns Price on request for undefined", () => {
    expect(formatPrice(undefined)).toBe("Price on request");
  });

  it("handles string price input", () => {
    const result = formatPrice("15000", "NPR");
    expect(result).toContain("15,000");
  });
});

describe("formatRelativeTime", () => {
  it("returns Today for current timestamp", () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("Today");
  });

  it("returns Yesterday for 1 day ago", () => {
    const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(yesterday)).toBe("Yesterday");
  });

  it("returns N days ago for recent timestamps", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe("3 days ago");
  });

  it("returns weeks ago for older timestamps", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoWeeksAgo)).toMatch(/weeks? ago/i);
  });

  it("returns — for null", () => {
    expect(formatRelativeTime(null)).toBe("—");
  });
});

describe("formatDate", () => {
  it("formats ISO date string to readable format", () => {
    const result = formatDate("2025-01-15T00:00:00Z");
    expect(result).toMatch(/Jan|January/i);
    expect(result).toContain("2025");
  });

  it("returns — for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns — for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });
});

describe("slugify", () => {
  it("converts title to URL-safe slug", () => {
    expect(slugify("Modern 2BHK Apartment in Thamel")).toBe("modern-2bhk-apartment-in-thamel");
  });

  it("converts to lowercase", () => {
    expect(slugify("THAMEL APARTMENT")).toBe("thamel-apartment");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });

  it("handles multiple spaces", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });
});
