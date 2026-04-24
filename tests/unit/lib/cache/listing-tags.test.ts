import {
  LISTING_PUBLIC_LIST_TAG,
  listingPublicDetailTag,
} from "@/lib/cache/listing-tags";

describe("listing-tags", () => {
  it("uses stable list tag", () => {
    expect(LISTING_PUBLIC_LIST_TAG).toBe("listings:public");
  });

  it("encodes detail tag with raw param", () => {
    expect(listingPublicDetailTag("abc-123")).toBe("listings:detail:abc-123");
    expect(listingPublicDetailTag("my-slug")).toBe("listings:detail:my-slug");
  });
});
