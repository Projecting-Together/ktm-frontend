"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { registerSchema, type RegisterInput } from "@/lib/validations/listingSchema";
import { useRegister } from "@/lib/hooks/useAuth";

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const { mutate: register_, isPending } = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-primary">
            <Building2 className="h-7 w-7 text-accent" />
            <span className="text-xl" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>KTM<span className="text-accent">Apartments</span></span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-muted-foreground">Join thousands of Kathmandu renters and owners</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit((data) => register_({ email: data.email, password: data.password }))} className="space-y-5">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">First name</label>
              <input id="firstName" {...register("firstName")} type="text" placeholder="Enter your first name" autoComplete="given-name"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
              {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium">Last name</label>
              <input id="lastName" {...register("lastName")} type="text" placeholder="Enter your last name" autoComplete="family-name"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
              {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email address</label>
              <input id="email" {...register("email")} type="email" placeholder="you@example.com" autoComplete="email"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <input id="password" {...register("password")} type={showPw ? "text" : "password"} placeholder="Min. 8 characters" autoComplete="new-password"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
                <button type="button" aria-label={showPw ? "Hide password" : "Show password"} aria-pressed={showPw} onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">Confirm password</label>
              <input id="confirmPassword" {...register("confirmPassword")} type="password" placeholder="Re-enter password" autoComplete="new-password"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isPending} className="btn-primary w-full justify-center gap-2 h-11">
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : "Create Account"}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="text-accent hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
