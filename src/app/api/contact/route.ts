import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations/contactFormSchema";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message =
      (first.name?.[0] ?? first.email?.[0] ?? first.message?.[0]) ?? "Validation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[contact] submission", {
      email: parsed.data.email,
      nameLength: parsed.data.name.length,
      messageLength: parsed.data.message.length,
    });
  }

  return NextResponse.json({ ok: true });
}
