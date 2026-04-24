import { strict as assert } from "node:assert";

import { buildEndpointTimingRows } from "../summarize-perf.mjs";

const snapshots = [
  {
    dataFlow: {
      endpointAvgMs: {
        "/_next/static/chunk.js": 120,
        "/api/v1/listings/": 50,
        "/images/logo.svg": 15,
      },
      endpointMaxMs: {
        "/_next/static/chunk.js": 180,
        "/api/v1/listings/": 80,
        "/images/logo.svg": 25,
      },
      endpointCount: {
        "/_next/static/chunk.js": 5,
        "/api/v1/listings/": 3,
        "/images/logo.svg": 2,
      },
    },
  },
];

const apiRows = buildEndpointTimingRows(snapshots, { apiOnly: true });
assert.equal(apiRows.length, 1);
assert.equal(apiRows[0].endpoint, "/api/v1/listings/");
assert.equal(apiRows[0].avgMs, 50);

const assetRows = buildEndpointTimingRows(snapshots, { globalAssetsOnly: true });
assert.equal(assetRows.length, 2);
assert.equal(assetRows.some((row) => row.endpoint.startsWith("/api/")), false);

const multiSnapshotRows = buildEndpointTimingRows(
  [
    {
      dataFlow: {
        endpointAvgMs: { "/api/v1/listings/": 40 },
        endpointMaxMs: { "/api/v1/listings/": 90 },
        endpointCount: { "/api/v1/listings/": 2 },
      },
    },
    {
      dataFlow: {
        endpointAvgMs: { "/api/v1/listings/": 60 },
        endpointMaxMs: { "/api/v1/listings/": 110 },
        endpointCount: { "/api/v1/listings/": 3 },
      },
    },
  ],
  { apiOnly: true },
);
assert.equal(multiSnapshotRows.length, 1);
assert.equal(multiSnapshotRows[0].endpoint, "/api/v1/listings/");
assert.equal(multiSnapshotRows[0].avgMs, 50);
assert.equal(multiSnapshotRows[0].maxMs, 110);
assert.equal(multiSnapshotRows[0].count, 5);

const globalAssetsOnlyRows = buildEndpointTimingRows(
  [
    {
      dataFlow: {
        endpointAvgMs: {
          "/marketplace": 130,
          "/fonts/inter.woff2": 22,
          "/_next/static/chunks/app.js": 45,
        },
        endpointMaxMs: {
          "/marketplace": 160,
          "/fonts/inter.woff2": 31,
          "/_next/static/chunks/app.js": 60,
        },
        endpointCount: {
          "/marketplace": 1,
          "/fonts/inter.woff2": 4,
          "/_next/static/chunks/app.js": 3,
        },
      },
    },
  ],
  { globalAssetsOnly: true },
);
assert.equal(globalAssetsOnlyRows.some((row) => row.endpoint === "/marketplace"), false);
assert.equal(globalAssetsOnlyRows.some((row) => row.endpoint === "/fonts/inter.woff2"), true);
assert.equal(globalAssetsOnlyRows.some((row) => row.endpoint === "/_next/static/chunks/app.js"), true);

console.log("summarize-perf.test.mjs passed");
