import { act } from "@testing-library/react";
import { useAuthStore } from "@/lib/stores/authStore";
import { mockRenter, mockOwner } from "@/test-utils/mockData";

// Mock the API client calls used by authStore
jest.mock("@/lib/api/client", () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ data: null }),
  logout: jest.fn().mockResolvedValue({}),
  clearTokens: jest.fn(),
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it("starts unauthenticated with null user", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("setUser authenticates the user", () => {
    act(() => {
      useAuthStore.getState().setUser(mockRenter);
    });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe("usr-renter-001");
    expect(state.user?.email).toBe("ram.sharma@gmail.com");
  });

  it("setUser(null) clears authentication", () => {
    act(() => {
      useAuthStore.getState().setUser(mockRenter);
      useAuthStore.getState().setUser(null);
    });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("correctly identifies renter role", () => {
    act(() => useAuthStore.getState().setUser(mockRenter));
    const { user } = useAuthStore.getState();
    expect(user?.role).toBe("renter");
  });

  it("correctly identifies owner role", () => {
    act(() => useAuthStore.getState().setUser(mockOwner));
    const { user } = useAuthStore.getState();
    expect(user?.role).toBe("owner");
  });

  it("hasRole returns true for matching role", () => {
    act(() => useAuthStore.getState().setUser(mockRenter));
    expect(useAuthStore.getState().hasRole("renter")).toBe(true);
  });

  it("hasRole returns false for non-matching role", () => {
    act(() => useAuthStore.getState().setUser(mockRenter));
    expect(useAuthStore.getState().hasRole("admin")).toBe(false);
  });

  it("hasRole accepts array of roles", () => {
    act(() => useAuthStore.getState().setUser(mockOwner));
    expect(useAuthStore.getState().hasRole(["owner", "agent"])).toBe(true);
  });

  it("canCreateListing returns true for owner", () => {
    act(() => useAuthStore.getState().setUser(mockOwner));
    expect(useAuthStore.getState().canCreateListing()).toBe(true);
  });

  it("canCreateListing returns false for renter", () => {
    act(() => useAuthStore.getState().setUser(mockRenter));
    expect(useAuthStore.getState().canCreateListing()).toBe(false);
  });

  it("isAdmin returns false for renter", () => {
    act(() => useAuthStore.getState().setUser(mockRenter));
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });
});
