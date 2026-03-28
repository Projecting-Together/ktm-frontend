import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

// Base path for @mswjs/interceptors CJS builds
const INTERCEPTORS =
  "<rootDir>/node_modules/.pnpm/@mswjs+interceptors@0.41.3/node_modules/@mswjs/interceptors";

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/test-utils/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // Force MSW to use CJS builds (avoids ESM import errors in Jest)
    "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
    "^msw$": "<rootDir>/node_modules/msw/lib/core/index.js",
    // Force @mswjs/interceptors sub-paths to use CJS
    "^@mswjs/interceptors/XMLHttpRequest$": `${INTERCEPTORS}/lib/node/interceptors/XMLHttpRequest/index.cjs`,
    "^@mswjs/interceptors/ClientRequest$": `${INTERCEPTORS}/lib/node/interceptors/ClientRequest/index.cjs`,
    "^@mswjs/interceptors/fetch$": `${INTERCEPTORS}/lib/node/interceptors/fetch/index.cjs`,
    "^@mswjs/interceptors$": `${INTERCEPTORS}/lib/node/index.cjs`,
  },
  testMatch: [
    "<rootDir>/__tests__/unit/**/*.test.{ts,tsx}",
    "<rootDir>/__tests__/integration/**/*.test.{ts,tsx}",
  ],
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  coverageThreshold: {
    global: { branches: 50, functions: 50, lines: 50, statements: 50 },
  },
};

export default createJestConfig(config);
