import { contactFormSchema } from "@/lib/validations/contactFormSchema";

describe("contactFormSchema", () => {
  it("accepts a valid payload", () => {
    const result = contactFormSchema.safeParse({
      name: "Sam User",
      email: "sam@example.com",
      message: "Hello team, I need help with my listing.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short messages", () => {
    const result = contactFormSchema.safeParse({
      name: "Sam",
      email: "sam@example.com",
      message: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = contactFormSchema.safeParse({
      name: "Sam",
      email: "not-email",
      message: "This message is definitely long enough.",
    });
    expect(result.success).toBe(false);
  });
});
