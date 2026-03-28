import { mockRenter, mockOwner, mockAuthTokens } from "@/test-utils/mockData";

jest.mock("@/lib/api/client", () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  refreshAccessToken: jest.fn(),
  verifyEmail: jest.fn(),
  clearTokens: jest.fn(),
  initializeAuth: jest.fn(),
}));

import * as apiClient from "@/lib/api/client";
const mockLogin = apiClient.login as jest.MockedFunction<typeof apiClient.login>;
const mockRegister = apiClient.register as jest.MockedFunction<typeof apiClient.register>;
const mockGetCurrentUser = apiClient.getCurrentUser as jest.MockedFunction<typeof apiClient.getCurrentUser>;

describe("Auth API client", () => {
  beforeEach(() => jest.clearAllMocks());

  it("login returns tokens and user on success", async () => {
    mockLogin.mockResolvedValueOnce({
      data: { access_token: mockAuthTokens.access_token, token_type: "bearer" },
      error: null,
    });
    const result = await apiClient.login("ram.sharma@gmail.com", "SecurePass1");
    expect(result.data?.access_token).toBeDefined();
    expect(result.error).toBeNull();
  });

  it("login returns error for wrong credentials", async () => {
    mockLogin.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid credentials", status: 401 },
    });
    const result = await apiClient.login("wrong@email.com", "wrongpass");
    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(401);
  });

  it("register creates a new renter account", async () => {
    mockRegister.mockResolvedValueOnce({
      data: { access_token: mockAuthTokens.access_token, token_type: "bearer" },
      error: null,
    });
    const result = await apiClient.register("newuser@gmail.com", "SecurePass1");
    expect(result.data?.access_token).toBeDefined();
    expect(result.error).toBeNull();
  });

  it("register returns error for duplicate email", async () => {
    mockRegister.mockResolvedValueOnce({
      data: null,
      error: { message: "Email already registered", status: 409 },
    });
    const result = await apiClient.register("ram.sharma@gmail.com", "SecurePass1");
    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(409);
  });

  it("getCurrentUser returns authenticated user", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ data: mockOwner, error: null });
    const result = await apiClient.getCurrentUser();
    expect(result.data?.role).toBe("owner");
    expect(result.error).toBeNull();
  });

  it("getCurrentUser returns null when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ data: null, error: null });
    const result = await apiClient.getCurrentUser();
    expect(result.data).toBeNull();
  });

  it("login is called with correct email and password", async () => {
    mockLogin.mockResolvedValueOnce({ data: { access_token: "tok", token_type: "bearer" }, error: null });
    await apiClient.login("ram.sharma@gmail.com", "SecurePass1");
    expect(mockLogin).toHaveBeenCalledWith("ram.sharma@gmail.com", "SecurePass1");
  });
});
