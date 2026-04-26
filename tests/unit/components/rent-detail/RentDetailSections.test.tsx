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

function buildRentListingWithCoordinates(): Listing {
  const base = buildRentListingFull();
  return {
    ...base,
    location: {
      ...base.location,
      latitude: "27.7172",
      longitude: "85.3240",
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

    expect(screen.getByTestId("rent-status-chip-Wi-Fi")).toHaveTextContent(MISSING_DETAIL_TEXT);
    expect(screen.getByTestId("rent-status-chip-Parking")).toHaveTextContent(MISSING_DETAIL_TEXT);
    expect(screen.getByText(`Map unavailable: ${MISSING_DETAIL_TEXT}.`)).toBeInTheDocument();
  });

  it("renders hybrid chips and compact table for utility and amenity sections", () => {
    render(<RentDetailSections listing={buildRentListingSparse()} />);

    expect(screen.getByTestId("rent-status-chip-Wi-Fi")).toBeInTheDocument();
    expect(screen.getByTestId("rent-status-chip-Parking")).toBeInTheDocument();
    expect(screen.getByTestId("rent-status-chip-Air Conditioning")).toBeInTheDocument();

    const rowEls = screen.getAllByTestId("rent-detail-row");
    expect(rowEls.length).toBeGreaterThanOrEqual(12);
    expect(screen.getAllByText("Wi-Fi").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Parking").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Air Conditioning").length).toBeGreaterThan(1);
  });

  it("shows deterministic map panel state when coordinates exist", () => {
    render(<RentDetailSections listing={buildRentListingWithCoordinates()} />);

    expect(screen.getByText("Map preview ready: 27.71720, 85.32400")).toBeInTheDocument();
    expect(screen.getByText("Coordinates source: listing location")).toBeInTheDocument();
  });
});
