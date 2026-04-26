import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import { RentDetailsTable } from "@/components/listings/rent-detail/RentDetailsTable";
import { RentSectionCard } from "@/components/listings/rent-detail/RentSectionCard";
import { RentStatusChips } from "@/components/listings/rent-detail/RentStatusChips";
import type { RentDetailRow, RentStatusRow } from "@/components/listings/rent-detail/types";

describe("rent detail section primitives", () => {
  it("renders status chips with tone-specific styles", () => {
    const rows: RentStatusRow[] = [
      { label: "Water", status: "Available", tone: "positive" },
      { label: "Gas", status: "Ask owner for this detail", tone: "warning" },
      { label: "Internet", status: "Ask owner for this detail", tone: "neutral" },
    ];

    render(<RentStatusChips rows={rows} />);

    expect(screen.getByText("Water")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();

    const positiveChip = screen.getByTestId("rent-status-chip-Water");
    const warningChip = screen.getByTestId("rent-status-chip-Gas");
    const neutralChip = screen.getByTestId("rent-status-chip-Internet");

    expect(positiveChip).toHaveClass("border-verified/30");
    expect(warningChip).toHaveClass("border-warning/30");
    expect(neutralChip).toHaveClass("border-border");
  });

  it("renders compact two-column detail table", () => {
    const rows: RentDetailRow[] = [
      { key: "Bedrooms", value: "2" },
      { key: "Floor", value: "3 of 5" },
    ];

    const { container } = render(<RentDetailsTable rows={rows} />);

    expect(screen.getByText("Bedrooms")).toBeInTheDocument();
    expect(screen.getByText("3 of 5")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-testid='rent-detail-row']")).toHaveLength(2);
  });

  it("renders section card title with wrapped content", () => {
    render(
      <RentSectionCard title="Utilities">
        <p>Section content</p>
      </RentSectionCard>,
    );

    expect(screen.getByRole("heading", { name: "Utilities" })).toBeInTheDocument();
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });
});
