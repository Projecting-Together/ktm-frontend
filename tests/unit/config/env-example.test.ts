import { readFileSync } from "node:fs";

describe(".env.example docs", () => {
  it("documents NEXT_PUBLIC_USE_MSW as the global mode toggle", () => {
    const envExample = readFileSync(".env.example", "utf8");

    expect(envExample).toContain("NEXT_PUBLIC_USE_MSW");
    expect(envExample).toContain(
      "true  => frontend uses MSW mock handlers and mock files."
    );
    expect(envExample).toContain(
      "false => frontend bypasses MSW and calls backend APIs."
    );
  });
});
