jest.mock("msw", () => {
  const makeHandlerFactory = (method: string) => {
    return (path: unknown, resolver: unknown) => ({
      info: { method, path },
      resolver,
    });
  };

  return {
    http: {
      all: makeHandlerFactory("ALL"),
      get: makeHandlerFactory("GET"),
      post: makeHandlerFactory("POST"),
      patch: makeHandlerFactory("PATCH"),
      delete: makeHandlerFactory("DELETE"),
    },
    HttpResponse: {
      json: (body: unknown, init?: { status?: number }) => {
        const status = init?.status ?? 200;
        const payload = body === null || body === undefined ? null : JSON.stringify(body);
        return new Response(payload, {
          status,
          headers: { "content-type": "application/json" },
        });
      },
    },
    passthrough: () => new Response(null, { status: 204 }),
  };
});

import { handlers } from "@/msw/handlers";
import { mockLocalities } from "@/test-utils/mockData";

type HandlerResolver = (args: { request: Request; params: Record<string, string>; cookies: Record<string, string> }) => Promise<Response> | Response;

function getResolverBySourceMarker(marker: string): HandlerResolver {
  const handler = handlers.find((item) => String((item as { resolver?: unknown }).resolver).includes(marker));
  if (!handler) {
    throw new Error(`Unable to locate handler resolver containing marker "${marker}"`);
  }
  return (handler as { resolver: HandlerResolver }).resolver;
}

describe("handlers scenario responses", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_MSW_SCENARIO_STATE;
  });

  it("returns empty listings for public empty scenario", async () => {
    process.env.NEXT_PUBLIC_MSW_SCENARIO_STATE = "empty";
    const resolveListings = getResolverBySourceMarker("filterListingItems");

    const response = await resolveListings({
      request: new Request("http://localhost:4010/api/v1/listings"),
      params: {},
      cookies: {},
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items).toEqual([]);
    expect(payload.total).toBe(0);
  });

  it("returns error status/body for public error scenario", async () => {
    process.env.NEXT_PUBLIC_MSW_SCENARIO_STATE = "error";
    const resolveListings = getResolverBySourceMarker("filterListingItems");

    const response = await resolveListings({
      request: new Request("http://localhost:4010/api/v1/listings"),
      params: {},
      cookies: {},
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ detail: "Internal server error" });
  });

  it("returns forbidden for permission scenario where applicable", async () => {
    process.env.NEXT_PUBLIC_MSW_SCENARIO_STATE = "permission";
    const resolveAuthMe = getResolverBySourceMarker("mockAdminAuthTokens.access_token");

    const authResponse = await resolveAuthMe({
      request: new Request("http://localhost:4010/api/v1/auth/me", {
        headers: { Authorization: "Bearer mock-token" },
      }),
      params: {},
      cookies: {},
    });
    const authPayload = await authResponse.json();

    expect(authResponse.status).toBe(403);
    expect(authPayload).toEqual({ detail: "Forbidden" });
  });

  it("falls back to existing endpoint behavior when scenario does not override", async () => {
    process.env.NEXT_PUBLIC_MSW_SCENARIO_STATE = "error";
    const resolveLocalities = getResolverBySourceMarker("mockLocalities");

    const response = await resolveLocalities({
      request: new Request("http://localhost:4010/api/v1/localities"),
      params: {},
      cookies: {},
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(mockLocalities);
  });
});
