"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { contactFormSchema, type ContactFormInput } from "@/lib/validations/contactFormSchema";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (data: ContactFormInput) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (!res.ok) {
        toast.error(typeof json.error === "string" ? json.error : "Could not send your message. Try again.");
        return;
      }

      toast.success("Thanks — we received your message and will get back to you soon.");
      reset();
    } catch {
      toast.error("Network error. Check your connection or email us directly.");
    }
  };

  const inputClass =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
      <h2 className="text-lg font-semibold">Send a message</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        We typically reply within one to two business days.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">
            Name
          </label>
          <input
            id="contact-name"
            {...register("name")}
            type="text"
            autoComplete="name"
            className={inputClass}
            placeholder="Your name"
          />
          {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name.message}</p> : null}
        </div>

        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="contact-email"
            {...register("email")}
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
          />
          {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">
            Message
          </label>
          <textarea
            id="contact-message"
            {...register("message")}
            rows={6}
            className={`min-h-[140px] resize-y py-2.5 ${inputClass}`}
            placeholder="How can we help?"
          />
          {errors.message ? <p className="mt-1 text-xs text-destructive">{errors.message.message}</p> : null}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary h-11 w-full justify-center gap-2 sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending...
            </>
          ) : (
            "Send message"
          )}
        </button>
      </form>
    </div>
  );
}
