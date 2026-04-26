import React from "react";
import { fireEvent, render, screen } from "@/test-utils/renderWithProviders";
import { Step1BasicInfo } from "@/components/listings/ListingForm/Step1BasicInfo";
import { useFormContext } from "react-hook-form";

jest.mock("react-hook-form", () => ({
  useFormContext: jest.fn(),
}));

const mockUseFormContext = useFormContext as unknown as jest.Mock;

describe("Step1BasicInfo", () => {
  let mockSetValue: jest.Mock;

  beforeEach(() => {
    mockSetValue = jest.fn();
    mockUseFormContext.mockReturnValue({
      register: jest.fn(() => ({})),
      watch: jest.fn(() => undefined),
      setValue: mockSetValue,
      formState: { errors: {} },
    });
  });

  it("shows land and video shooting property types", () => {
    render(<Step1BasicInfo />);

    expect(screen.getByText("Land")).toBeInTheDocument();
    expect(screen.getByText("Video Shooting")).toBeInTheDocument();
  });

  it("does not render emoji prefixes for property types", () => {
    render(<Step1BasicInfo />);

    expect(screen.queryByText("🏢")).not.toBeInTheDocument();
    expect(screen.queryByText("🛏")).not.toBeInTheDocument();
    expect(screen.queryByText("🏠")).not.toBeInTheDocument();
    expect(screen.queryByText("🏨")).not.toBeInTheDocument();
    expect(screen.queryByText("🌆")).not.toBeInTheDocument();
    expect(screen.queryByText("🏪")).not.toBeInTheDocument();
  });

  it("sets listing_type to land when Land is clicked", () => {
    render(<Step1BasicInfo />);

    fireEvent.click(screen.getByRole("button", { name: /land/i }));

    expect(mockSetValue).toHaveBeenCalledWith("listing_type", "land", { shouldValidate: true });
  });

  it("sets listing_type to video_shooting when Video Shooting is clicked", () => {
    render(<Step1BasicInfo />);

    fireEvent.click(screen.getByRole("button", { name: /video shooting/i }));

    expect(mockSetValue).toHaveBeenCalledWith("listing_type", "video_shooting", { shouldValidate: true });
  });
});
