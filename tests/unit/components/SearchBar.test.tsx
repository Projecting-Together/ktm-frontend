import React from "react";
import { render, screen, fireEvent } from "@/test-utils/renderWithProviders";
import { SearchBar } from "@/components/search/SearchBar";

describe("SearchBar", () => {
  it("renders without crashing", () => {
    const { container } = render(<SearchBar />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders a single keyword search input field", () => {
    render(<SearchBar />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(1);
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

  it("normalizes query before invoking onSearch callback", () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("textbox", { name: /search/i });
    fireEvent.change(input, { target: { value: "  studio apartment  " } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(onSearch).toHaveBeenCalledWith("studio apartment");
  });

  it("passes empty query for whitespace-only search", () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("textbox", { name: /search/i });
    fireEvent.change(input, { target: { value: "    " } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(onSearch).toHaveBeenCalledWith("");
  });

  it("exposes keyword input with accessible search label in both sizes", () => {
    const { rerender } = render(<SearchBar />);
    expect(screen.getByRole("textbox", { name: /search/i })).toBeInTheDocument();
    rerender(<SearchBar size="sm" />);
    expect(screen.getByRole("textbox", { name: /search/i })).toBeInTheDocument();
  });
});
