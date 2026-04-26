import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MswGate } from "@/lib/providers/MswGate";

const startMswMock = jest.fn<Promise<void>, []>();

jest.mock("@/msw/startBrowserWorker", () => ({
  startMsw: () => startMswMock(),
}));

describe("global mock mode gate behavior", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_USE_MSW;
    startMswMock.mockReset();
  });

  it("does not attempt worker startup when NEXT_PUBLIC_USE_MSW is not true", () => {
    process.env.NEXT_PUBLIC_USE_MSW = "false";

    render(
      React.createElement(
        MswGate,
        undefined,
        React.createElement("div", undefined, "App content"),
      ),
    );

    expect(screen.getByText("App content")).toBeInTheDocument();
    expect(screen.queryByText("Starting mock API…")).not.toBeInTheDocument();
    expect(startMswMock).not.toHaveBeenCalled();
  });

  it("attempts worker startup when NEXT_PUBLIC_USE_MSW is true", async () => {
    process.env.NEXT_PUBLIC_USE_MSW = "true";
    startMswMock.mockResolvedValue(undefined);

    render(
      React.createElement(
        MswGate,
        undefined,
        React.createElement("div", undefined, "App content"),
      ),
    );

    expect(screen.getByText("Starting mock API…")).toBeInTheDocument();
    await waitFor(() => {
      expect(startMswMock).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("App content")).toBeInTheDocument();
  });
});
