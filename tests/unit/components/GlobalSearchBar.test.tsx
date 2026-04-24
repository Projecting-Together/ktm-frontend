import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";

describe("GlobalSearchBar", () => {
  it("renders an accessible search landmark with search button", () => {
    render(<GlobalSearchBar />);

    expect(screen.getByRole("search", { name: /global apartment search/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });
});
