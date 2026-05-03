"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { mapProfileDto } from "@/lib/contracts/profile";

export default function SettingsProfilePage() {
  const { user } = useAuthStore();
  const [savedNotice, setSavedNotice] = useState("");

  const mappedProfile = useMemo(
    () =>
      mapProfileDto({
        id: user?.id ?? "local-user",
        email: user?.email ?? "guest@example.com",
        role: user?.role ?? "user",
        profile: {
          first_name: user?.profile?.first_name ?? "",
          last_name: user?.profile?.last_name ?? "",
          bio: user?.profile?.bio ?? "",
          phone: user?.profile?.phone ?? "",
          avatar_url: user?.profile?.avatar_url ?? "",
        },
      }),
    [user],
  );

  const [form, setForm] = useState(() => ({
    firstName: mappedProfile.firstName,
    lastName: mappedProfile.lastName,
    bio: mappedProfile.bio,
    phone: mappedProfile.phone,
  }));

  useEffect(() => {
    setForm({
      firstName: mappedProfile.firstName,
      lastName: mappedProfile.lastName,
      bio: mappedProfile.bio,
      phone: mappedProfile.phone,
    });
  }, [mappedProfile]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedNotice("Saved locally. API hook-up is the next step.");
  };

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/settings" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Back to settings
      </Link>
      <h1 className="text-2xl font-bold">Edit profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">This is a frontend-only profile form backed by the shared profile DTO contract.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">First name</span>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
              value={form.firstName}
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Last name</span>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
            />
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Bio</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            value={form.bio}
            onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Phone</span>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
        </label>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">Signed in as {mappedProfile.email}</p>
          <button type="submit" className="btn-primary">
            Save profile
          </button>
        </div>
      </form>

      <p role="status" aria-live="polite" className="mt-3 text-sm text-verified">
        {savedNotice}
      </p>
    </div>
  );
}
