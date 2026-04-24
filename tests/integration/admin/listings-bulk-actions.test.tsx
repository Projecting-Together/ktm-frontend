import React from "react";
import { fireEvent, render, screen, waitFor } from "@/test-utils/renderWithProviders";
import AdminListingsPage from "@/app/admin/listings/page";

describe("admin listings bulk actions", () => {
  it("selects a row and bulk approves with success feedback", async () => {
    render(<AdminListingsPage />);

    const rowCheckbox = await screen.findByRole("checkbox", { name: /select listing l1/i });
    fireEvent.click(rowCheckbox);

    const bulkApproveButton = await screen.findByRole("button", { name: /bulk approve/i });
    fireEvent.click(bulkApproveButton);

    await waitFor(() => {
      expect(screen.getByText(/bulk approved 1 listing/i)).toBeInTheDocument();
    });
  });

  it("clears hidden-row selection when filters change", async () => {
    render(<AdminListingsPage />);

    const rowCheckbox = await screen.findByRole("checkbox", { name: /select listing l1/i });
    fireEvent.click(rowCheckbox);
    expect(rowCheckbox).toBeChecked();

    const statusFilter = await screen.findByLabelText(/filter by status/i);
    fireEvent.change(statusFilter, { target: { value: "rejected" } });

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /bulk approve/i })).not.toBeInTheDocument();
    });

    fireEvent.change(statusFilter, { target: { value: "" } });

    const sameRowCheckbox = await screen.findByRole("checkbox", { name: /select listing l1/i });
    expect(sameRowCheckbox).not.toBeChecked();
    expect(screen.queryByText(/bulk approved 1 listing/i)).not.toBeInTheDocument();
  });
});
