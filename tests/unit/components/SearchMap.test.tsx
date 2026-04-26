import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import { SearchMap } from "@/components/map/SearchMap";
import { mockListingItems } from "@/test-utils/mockData";
import type { ListingListItem } from "@/lib/api/client";

jest.mock("leaflet", () => ({
  __esModule: true,
  default: {
    latLngBounds: jest.fn(() => ({})),
  },
}));

jest.mock("react-leaflet", () => ({
  Marker: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map-marker">{children}</div>
  ),
  Popup: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="marker-popup">{children}</div>
  ),
  useMap: () => ({
    fitBounds: jest.fn(),
  }),
}));

jest.mock("@/components/map/MapView", () => ({
  MapView: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map-view">{children}</div>
  ),
}));

jest.mock("@/components/map/leaflet-defaults", () => ({
  ensureLeafletDefaultIcons: jest.fn(),
}));

describe("SearchMap", () => {
  it("renders simple markers without any price label overlay text", () => {
    render(<SearchMap listings={mockListingItems.slice(0, 2)} />);

    expect(screen.getAllByTestId("map-marker")).toHaveLength(2);
    expect(screen.queryByText(/NPR/i)).not.toBeInTheDocument();
  });

  it("excludes listings with missing or invalid coordinates from markers", () => {
    const valid = mockListingItems[0];
    const listings: ListingListItem[] = [
      valid,
      { ...mockListingItems[1], id: "missing-lat", location: { ...mockListingItems[1].location!, latitude: null } },
      { ...mockListingItems[2], id: "missing-lng", location: { ...mockListingItems[2].location!, longitude: null } },
      { ...mockListingItems[3], id: "nan-lat", location: { ...mockListingItems[3].location!, latitude: "bad-lat" as unknown as number } },
      { ...mockListingItems[4], id: "nan-lng", location: { ...mockListingItems[4].location!, longitude: "bad-lng" as unknown as number } },
    ];

    render(<SearchMap listings={listings} />);
    expect(screen.getAllByTestId("map-marker")).toHaveLength(1);
    expect(screen.queryByText(/NPR/i)).not.toBeInTheDocument();
  });

  it("shows empty-coordinate overlay when no listings have valid coordinates", () => {
    const listings: ListingListItem[] = [
      { ...mockListingItems[0], id: "no-location", location: null },
      { ...mockListingItems[1], id: "bad-location", location: { ...mockListingItems[1].location!, latitude: "not-a-number" as unknown as number, longitude: null } },
    ];

    render(<SearchMap listings={listings} />);
    expect(screen.queryByTestId("map-marker")).not.toBeInTheDocument();
    expect(
      screen.getByText("No listings with map coordinates in this result set."),
    ).toBeInTheDocument();
  });

  it("shows neighborhood/location context in marker popup", () => {
    render(<SearchMap listings={[mockListingItems[0]]} />);

    expect(screen.getByText("Thamel, Kathmandu")).toBeInTheDocument();
  });

  it("shows area in marker popup as m² text only when available", () => {
    const listingWithArea = { ...mockListingItems[0], id: "with-area", area_m2: 1200 };
    const listingWithoutArea = { ...mockListingItems[1], id: "without-area", area_m2: null };

    render(<SearchMap listings={[listingWithArea, listingWithoutArea]} />);

    expect(screen.getByText("Area: 1200 m²")).toBeInTheDocument();
    expect(screen.getAllByText(/m²/i)).toHaveLength(1);
  });
});
