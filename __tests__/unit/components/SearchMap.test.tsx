import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import { SearchMap } from "@/components/map/SearchMap";
import { mockListingItems } from "@/test-utils/mockData";

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
});
