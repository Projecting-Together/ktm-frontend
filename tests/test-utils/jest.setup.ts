import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill TextEncoder/TextDecoder (required by MSW in jsdom)
global.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
global.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

// Polyfill Web Streams API (required by MSW 2.x in jsdom)
import { ReadableStream, TransformStream, WritableStream } from "stream/web";
if (!globalThis.ReadableStream) (globalThis as unknown as Record<string, unknown>).ReadableStream = ReadableStream;
if (!globalThis.TransformStream) (globalThis as unknown as Record<string, unknown>).TransformStream = TransformStream;
if (!globalThis.WritableStream) (globalThis as unknown as Record<string, unknown>).WritableStream = WritableStream;

// Polyfill fetch/Response/Request for MSW in Node (Jest)
import { fetch, Headers, Request, Response } from "cross-fetch";
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request as unknown as typeof globalThis.Request;
global.Response = Response as unknown as typeof globalThis.Response;

// Silence Next.js router warnings in tests
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  redirect: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // Return a plain <img> element via React.createElement (not a DOM node)
  default: function MockImage({ src, alt, fill, priority, ...rest }: { src: string; alt: string; fill?: boolean; priority?: boolean; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return require("react").createElement("img", { src, alt, ...rest });
  },
}));

// Suppress known React/Next.js warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Warning:")) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
