import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import { Step1BasicInfo } from "@/components/listings/ListingForm/Step1BasicInfo";
import { useFormContext } from "react-hook-form";

jest.mock("react-hook-form", () => ({
  useFormContext: jest.fn(),
}));

const mockUseFormContext = useFormContext as unknown as jest.Mock;

describe("Step1BasicInfo", () => {
  beforeEach(() => {
    mockUseFormContext.mockReturnValue({
      register: jest.fn(() => ({})),
      watch: jest.fn(() => undefined),
      setValue: jest.fn(),
      formState: { errors: {} },
    });
  });

  it("shows land and video shooting property types", () => {
    render(<Step1BasicInfo />);

    expect(screen.getByText("Land")).toBeInTheDocument();
    expect(screen.getByText("Video Shooting")).toBeInTheDocument();
  });

  it("does not render emoji prefixes for property types", () => {
    const { container } = render(<Step1BasicInfo />);

    expect(container.textContent ?? "").not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
