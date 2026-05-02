import {
  step1Schema,
  step4Schema,
  loginSchema,
  registerSchema,
} from "@/lib/validations/listingSchema";

describe("step1Schema — BasicInfo", () => {
  const validStep1 = {
    title: "Modern 2BHK Apartment in Thamel",
    listing_type: "apartment" as const,
    purpose: "rent" as const,
    address_line: "Thamel Marg, Ward 26",
  };

  it("passes with valid data", () => {
    const result = step1Schema.safeParse(validStep1);
    expect(result.success).toBe(true);
  });

  it("fails when title is too short (under 10 chars)", () => {
    const result = step1Schema.safeParse({ ...validStep1, title: "Short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("title");
    }
  });

  it("fails with invalid listing_type", () => {
    const result = step1Schema.safeParse({ ...validStep1, listing_type: "mansion" });
    expect(result.success).toBe(false);
  });

  it("fails when address_line is too short", () => {
    const result = step1Schema.safeParse({ ...validStep1, address_line: "A" });
    expect(result.success).toBe(false);
  });

  it("allows step 1 without locality_id", () => {
    const result = step1Schema.safeParse(validStep1);
    expect(result.success).toBe(true);
  });

  it("fails when locality_id is provided but not a UUID", () => {
    const result = step1Schema.safeParse({ ...validStep1, locality_id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid listing types", () => {
    const types = [
      "apartment",
      "room",
      "house",
      "studio",
      "penthouse",
      "commercial",
      "land",
      "video_shooting",
    ] as const;
    types.forEach((type) => {
      const result = step1Schema.safeParse({ ...validStep1, listing_type: type });
      expect(result.success).toBe(true);
    });
  });
});

describe("step4Schema — Pricing", () => {
  const validStep4 = {
    price: 28000,
    price_period: "monthly" as const,
    currency: "NPR",
    security_deposit: 56000,
    price_negotiable: false,
  };

  it("passes with valid NPR price", () => {
    const result = step4Schema.safeParse(validStep4);
    expect(result.success).toBe(true);
  });

  it("fails when price is below minimum (1000)", () => {
    const result = step4Schema.safeParse({ ...validStep4, price: 500 });
    expect(result.success).toBe(false);
  });

  it("fails when price is negative", () => {
    const result = step4Schema.safeParse({ ...validStep4, price: -5000 });
    expect(result.success).toBe(false);
  });

  it("fails when price exceeds maximum (5,000,000)", () => {
    const result = step4Schema.safeParse({ ...validStep4, price: 6_000_000 });
    expect(result.success).toBe(false);
  });

  it("accepts all valid price periods", () => {
    const periods = ["monthly", "yearly", "daily"] as const;
    periods.forEach((period) => {
      const result = step4Schema.safeParse({ ...validStep4, price_period: period });
      expect(result.success).toBe(true);
    });
  });
});

describe("loginSchema", () => {
  it("passes with valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "ram.sharma@gmail.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("fails with invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("fails with password under 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "ram.sharma@gmail.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("fails with empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "password123" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validRegistration = {
    firstName: "Ram",
    lastName: "Sharma",
    email: "newuser@gmail.com",
    password: "SecurePass1",
    confirmPassword: "SecurePass1",
  };

  it("passes with matching passwords and required identity fields", () => {
    const result = registerSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
  });

  it("fails when firstName is missing", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      firstName: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails when lastName is missing", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      lastName: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails when passwords do not match", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: "DifferentPass2",
    });
    expect(result.success).toBe(false);
  });

  it("fails when password has no uppercase letter", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: "lowercase1",
      confirmPassword: "lowercase1",
    });
    expect(result.success).toBe(false);
  });

  it("fails when password has no number", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: "NoNumbers!",
      confirmPassword: "NoNumbers!",
    });
    expect(result.success).toBe(false);
  });
});
