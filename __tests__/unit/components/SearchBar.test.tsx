import React from "react";
import { render, screen, fireEvent } from "@/test-utils/renderWithProviders";
import { SearchBar } from "@/components/search/SearchBar";

describe("SearchBar", () => {
  it("renders without crashing", () => {
    const { container } = render(<SearchBar />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders a search input field", () => {
    render(<SearchBar />);
    // SearchBar may have multiple textboxes (keyword + location)
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("renders a search button", () => {
    render(<SearchBar />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("accepts user input", () => {
    render(<SearchBar />);
    const inputs = screen.getAllByRole("textbox");
    const firstInput = inputs[0];
    fireEvent.change(firstInput, { target: { value: "Thamel apartment" } });
    expect((firstInput as HTMLInputElement).value).toBe("Thamel apartment");
  });

  it("does not throw when search button is clicked", () => {
    render(<SearchBar />);
    const buttons = screen.getAllByRole("button");
    expect(() => fireEvent.click(buttons[0])).not.toThrow();
  });
});
