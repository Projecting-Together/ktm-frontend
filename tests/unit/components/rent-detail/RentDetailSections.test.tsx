import { RentDetailSections } from "@/components/listings/rent-detail/RentDetailSections";
import { MISSING_DETAIL_TEXT } from "@/components/listings/rent-detail/types";
import type { Listing } from "@/lib/api/types";
import { mockListings } from "@/test-utils/mockData";
import { render, screen } from "@/test-utils/renderWithProviders";

function buildRentListingFull(): Listing {
  const listing = mockListings.find((item) => item.purpose === "rent");
  if (!listing) {
    throw new Error("Expected at least one rent listing in mockListings");
  }

  return listing;
}

function buildRentListingSparse(): Listing {
  const base = buildRentListingFull();
  return {
    ...base,
    description: null,
    amenities: [],
    furnishing: null,
    floor: null,
    total_floors: null,
    bedrooms: null,
    bathrooms: null,
    area_sqft: null,
    parking: null,
    pets_allowed: null,
    smoking_allowed: null,
    available_from: null,
    location: {
      ...base.location,
      latitude: null,
      longitude: null,
    },
  };
}

describe("RentDetailSections", () => {
  it("renders rent sections in approved order", () => {
    render(<RentDetailSections listing={buildRentListingSparse()} />);

    const headings = screen.getAllByRole("heading").map((heading) => heading.textContent?.trim());
    expect(headings).toEqual([
      "Description",
      "Utilities",
      "Building Amenities",
      "Unit Utilities",
      "Floor Plan",
      "Property Details",
      "Location",
    ]);
  });

  it("shows fallback text for missing rows and sections", () => {
    render(<RentDetailSections listing={buildRentListingSparse()} />);

    expect(screen.getAllByText(MISSING_DETAIL_TEXT).length).toBeGreaterThan(0);
  });
});
