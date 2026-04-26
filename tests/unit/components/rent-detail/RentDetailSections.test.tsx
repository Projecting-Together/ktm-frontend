import { RentDetailSections } from "@/components/listings/rent-detail/RentDetailSections";
import { MISSING_DETAIL_TEXT } from "@/components/listings/rent-detail/types";
import { render, screen, within } from "@/test-utils/renderWithProviders";
import {
  buildRentListingFull,
  buildRentListingSparse,
  buildRentListingMixed,
  buildRentListingPremium,
  buildRentListingMinimal,
} from "@/test-utils/mockData";

describe("RentDetailSections", () => {
  it("keeps all required rent fixture variants available", () => {
    const variants = [
      buildRentListingFull(),
      buildRentListingSparse(),
      buildRentListingMixed(),
      buildRentListingPremium(),
      buildRentListingMinimal(),
    ];

    expect(variants).toHaveLength(5);
    expect(new Set(variants.map((variant) => variant.id)).size).toBe(5);
    expect(variants.every((variant) => variant.purpose === "rent")).toBe(true);
  });

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

  it("keeps floor plan fallback deterministic regardless of listing images", () => {
    render(<RentDetailSections listing={buildRentListingFull()} />);

    const floorPlanHeading = screen.getByRole("heading", { name: "Floor Plan" });
    const floorPlanSection = floorPlanHeading.closest("section");
    expect(floorPlanSection).not.toBeNull();
    expect(within(floorPlanSection as HTMLElement).getByText(MISSING_DETAIL_TEXT)).toBeInTheDocument();
    expect(within(floorPlanSection as HTMLElement).queryByText("Floor plan image is not provided separately for this listing.")).not.toBeInTheDocument();
  });

  it("renders hybrid chips and compact table for utility and amenity sections", () => {
    render(<RentDetailSections listing={buildRentListingSparse()} />);

    expect(screen.getByTestId("rent-status-chip-Wi-Fi")).toBeInTheDocument();
    expect(screen.getByTestId("rent-status-chip-Parking")).toBeInTheDocument();
    expect(screen.getByTestId("rent-status-chip-Air Conditioning")).toBeInTheDocument();
    expect(screen.getByTestId("rent-status-chip-Heating")).toBeInTheDocument();

    const rowEls = screen.getAllByTestId("rent-detail-row");
    expect(rowEls.length).toBeGreaterThanOrEqual(12);
    expect(screen.getAllByText("Wi-Fi").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Parking").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Air Conditioning").length).toBeGreaterThan(1);
  });

  it("shows deterministic map panel state when coordinates exist", () => {
    const listing = buildRentListingMixed();
    render(<RentDetailSections listing={listing} />);

    expect(screen.getByText("Map preview ready: 27.71720, 85.32400")).toBeInTheDocument();
    expect(screen.getByText("Coordinates source: listing location")).toBeInTheDocument();
  });

  it("renders premium listing details without missing value placeholders", () => {
    render(<RentDetailSections listing={buildRentListingPremium()} />);

    expect(screen.getByText("1800.0 m²")).toBeInTheDocument();
    expect(screen.getAllByText("Available").length).toBeGreaterThan(0);
  });
});
