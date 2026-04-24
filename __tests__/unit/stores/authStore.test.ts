import { act } from "@testing-library/react";
import { useAuthStore } from "@/lib/stores/authStore";
import { mockAgent, mockOwner } from "@/test-utils/mockData";

const mockUpgradeCurrentUserToAgent = jest.fn();

jest.mock("@/lib/api/client", () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ data: null }),
  logout: jest.fn().mockResolvedValue({}),
  clearTokens: jest.fn(),
  upgradeCurrentUserToAgent: (...args: unknown[]) => mockUpgradeCurrentUserToAgent(...args),
}));

describe("authStore upgradeToAgent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it("upgrades current user role to agent on success", async () => {
    mockUpgradeCurrentUserToAgent.mockResolvedValue({ data: mockAgent, error: null });

    act(() => {
      useAuthStore.getState().setUser(mockOwner);
    });

    await act(async () => {
      await useAuthStore.getState().upgradeToAgent();
    });

    const state = useAuthStore.getState();
    expect(mockUpgradeCurrentUserToAgent).toHaveBeenCalledTimes(1);
    expect(state.user?.role).toBe("agent");
    expect(state.isAuthenticated).toBe(true);
  });

  it("throws and keeps existing role unchanged when upgrade fails", async () => {
    mockUpgradeCurrentUserToAgent.mockResolvedValue({
      data: null,
      error: { message: "Upgrade failed", status: 400 },
    });

    act(() => {
      useAuthStore.getState().setUser(mockOwner);
    });

    await expect(useAuthStore.getState().upgradeToAgent()).rejects.toThrow("Upgrade failed");

    const state = useAuthStore.getState();
    expect(state.user?.role).toBe("owner");
    expect(state.isAuthenticated).toBe(true);
  });
});
