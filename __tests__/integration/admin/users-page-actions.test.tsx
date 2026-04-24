import React from "react";
import { fireEvent, render, screen, waitFor } from "@/test-utils/renderWithProviders";
import AdminUsersPage from "@/app/admin/users/page";

describe("admin users page actions", () => {
  const confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true);

  afterAll(() => {
    confirmSpy.mockRestore();
  });

  it("handles role change, suspend, force reset, and delete with feedback", async () => {
    render(<AdminUsersPage />);

    const roleSelect = await screen.findByLabelText(/change role for user u2/i);
    fireEvent.change(roleSelect, { target: { value: "moderator" } });

    await waitFor(() => {
      expect(screen.getByText(/role for user u2 updated to moderator/i)).toBeInTheDocument();
    });

    const suspendButton = await screen.findByRole("button", { name: /suspend user u2/i });
    fireEvent.click(suspendButton);

    await waitFor(() => {
      expect(screen.getByText(/user u2 suspended/i)).toBeInTheDocument();
    });

    const forceResetButton = await screen.findByRole("button", { name: /force password reset for user u2/i });
    fireEvent.click(forceResetButton);

    await waitFor(() => {
      expect(screen.getByText(/password reset forced for user u2/i)).toBeInTheDocument();
    });

    const deleteButton = await screen.findByRole("button", { name: /delete user u2/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/user u2 deleted/i)).toBeInTheDocument();
      expect(screen.queryByText("agent@test.com")).not.toBeInTheDocument();
    });
  });
});
