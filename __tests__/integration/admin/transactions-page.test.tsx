import React from "react";
import { fireEvent, render, screen, waitFor } from "@/test-utils/renderWithProviders";
import AdminTransactionsPage from "@/app/admin/transactions/page";

describe("admin transactions page", () => {
  it("shows export csv button", async () => {
    render(<AdminTransactionsPage />);

    expect(await screen.findByRole("button", { name: /export csv/i })).toBeInTheDocument();
  });

  it("updates status and shows success feedback", async () => {
    render(<AdminTransactionsPage />);

    const updateSelect = (await screen.findByLabelText(/update status for transaction t2/i)) as HTMLSelectElement;
    fireEvent.change(updateSelect, { target: { value: "paid" } });

    await waitFor(() => {
      expect(screen.getByText(/transaction t2 updated to paid/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(updateSelect.value).toBe("paid");
    });
  });
});
