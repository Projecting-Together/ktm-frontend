import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(254, "Email is too long."),
  message: z
    .string()
    .trim()
    .min(10, "Please enter at least 10 characters.")
    .max(5000, "Message is too long."),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
