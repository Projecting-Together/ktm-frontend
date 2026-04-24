import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { login, logout, register, getCurrentUser, refreshAccessToken, persistTokens } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function setSessionCookies(accessToken: string, role?: string) {
  document.cookie = `accessToken=${accessToken}; Path=/; SameSite=Lax`;
  if (role) {
    document.cookie = `userRole=${role}; Path=/; SameSite=Lax`;
  }
}

function clearSessionCookies() {
  document.cookie = "accessToken=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "userRole=; Path=/; Max-Age=0; SameSite=Lax";
}

export const authKeys = {
  user: ["auth", "user"] as const,
};

export function useCurrentUser() {
  const { setUser } = useAuthStore();
  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const res = await getCurrentUser();
      if (res.error) {
        setUser(null);
        return null;
      }
      setUser(res.data);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await login(email, password);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    onSuccess: async (tokens) => {
      persistTokens(tokens);
      setSessionCookies(tokens.access_token);
      const userRes = await getCurrentUser();
      if (userRes.data) {
        setSessionCookies(tokens.access_token, userRes.data.role);
        setUser(userRes.data);
        qc.setQueryData(authKeys.user, userRes.data);
      }
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await register(email, password);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    onSuccess: () => {
      toast.success("Account created! Please check your email to verify.");
      router.push("/login");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const { logout: storeLogout } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await logout();
      storeLogout();
      clearSessionCookies();
    },
    onSuccess: () => {
      qc.clear();
      router.push("/");
      toast.success("Logged out");
    },
  });
}
