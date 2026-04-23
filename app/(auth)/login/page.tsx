"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { loginSchema, type LoginInput } from "@/lib/validations/listingSchema";
import { useLogin } from "@/lib/hooks/useAuth";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-primary">
            <Building2 className="h-7 w-7 text-accent" />
            <span className="text-xl" style={{fontFamily:"'DM Serif Display', serif"}}>KTM<span className="text-accent">Apartments</span></span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit((data) => login(data))} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email address</label>
              <input id="email" {...register("email")} type="email" placeholder="you@example.com" autoComplete="email"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input id="password" {...register("password")} type={showPw ? "text" : "password"} placeholder="••••••••" autoComplete="current-password"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
                <button type="button" aria-label={showPw ? "Hide password" : "Show password"} aria-pressed={showPw} onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isPending} className="btn-primary w-full justify-center gap-2 h-11">
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign in"}
            </button>
            <button type="button" disabled aria-disabled="true" className="h-11 w-full cursor-not-allowed rounded-lg border border-border bg-background text-sm font-medium text-muted-foreground opacity-70">
              Sign in with Google (coming soon)
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-accent hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
