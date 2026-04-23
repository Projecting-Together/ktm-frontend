import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
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
  it("shows a Google sign-in action on the login page", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument();
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
});
