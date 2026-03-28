"use client";
import { useAuthStore } from "@/lib/stores/authStore";
import { useLogout } from "@/lib/hooks/useAuth";
import { LogOut, User, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="space-y-4 max-w-lg">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-accent" />
            <h3 className="font-semibold">Profile</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="capitalize">{user?.role}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="capitalize">{user?.status}</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-accent" />
            <h3 className="font-semibold">Security</h3>
          </div>
          <button className="btn-secondary text-sm">Change Password</button>
        </div>

        <button onClick={() => logout()} disabled={isPending}
          className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 w-full">
          <LogOut className="h-4 w-4" />
          {isPending ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}
