import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";

const loginMutateMock = jest.fn();
const registerMutateMock = jest.fn();

jest.mock("@/lib/hooks/useAuth", () => ({
  useLogin: () => ({
    mutate: loginMutateMock,
    isPending: false,
  }),
  useRegister: () => ({
    mutate: registerMutateMock,
    isPending: false,
  }),
}));

describe("Auth pages", () => {
  it("shows Google sign-in as disabled coming-soon action", () => {
    render(<LoginPage />);

    const googleButton = screen.getByRole("button", {
      name: /sign in with google \(coming soon\)/i,
    });

    expect(googleButton).toBeDisabled();
    expect(googleButton).toHaveAttribute("aria-disabled", "true");
  });

  it("associates login labels with email/password inputs", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email address/i)).toHaveAttribute("id", "email");
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("id", "password");
  });

  it("updates login password toggle accessibility state", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const toggleButton = screen.getByRole("button", { name: /show password/i });
    expect(toggleButton).toHaveAttribute("aria-pressed", "false");

    await user.click(toggleButton);
    expect(screen.getByRole("button", { name: /hide password/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("renders register form with approved field set and no role selection", () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    expect(screen.queryByText(/i am a/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/property owner/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/agent \/ broker/i)).not.toBeInTheDocument();
    expect(document.querySelector('input[name="role"]')).toBeNull();
  });

  it("updates register password toggle accessibility state", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const toggleButton = screen.getByRole("button", { name: /show password/i });
    expect(toggleButton).toHaveAttribute("aria-pressed", "false");

    await user.click(toggleButton);
    expect(screen.getByRole("button", { name: /hide password/i })).toHaveAttribute("aria-pressed", "true");
  });
});
