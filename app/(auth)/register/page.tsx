"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { register } from "@/lib/api/client";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const response = await register(email, password);

    if (response.error) {
      setError(response.error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/login";
  }

  return (
    <main className="container py-10">
      <h1 className="mb-4">Register</h1>
      <form onSubmit={onSubmit} className="max-w-md space-y-4">
        <input name="email" type="email" required placeholder="Email" className="w-full rounded border px-3 py-2" />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full rounded border px-3 py-2"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-60">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already registered? <Link href="/login">Login</Link>
      </p>
    </main>
  );
}
