/** @jest-environment node */

const mockRevalidateTag = jest.fn();
jest.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}));

const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => mockGet(name) }),
}));

import { revalidatePublicListingCache } from "@/lib/cache/revalidate-public-listings";
import { LISTING_PUBLIC_LIST_TAG, listingPublicDetailTag } from "@/lib/cache/listing-tags";

describe("revalidatePublicListingCache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no-ops without accessToken cookie", async () => {
    mockGet.mockReturnValue(undefined);
    const r = await revalidatePublicListingCache("x");
    expect(r.ok).toBe(false);
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it("revalidates list and detail tags when session present", async () => {
    mockGet.mockImplementation((name: string) =>
      name === "accessToken" ? { value: "t" } : undefined
    );
    const r = await revalidatePublicListingCache("listing-1");
    expect(r.ok).toBe(true);
    expect(mockRevalidateTag).toHaveBeenCalledWith(LISTING_PUBLIC_LIST_TAG);
    expect(mockRevalidateTag).toHaveBeenCalledWith(listingPublicDetailTag("listing-1"));
  });
});
