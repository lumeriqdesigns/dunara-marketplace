import { NextResponse } from "next/server";
import { expireTrials } from "@/features/billing/lib/subscription-service";

/**
 * Call from Vercel Cron or external scheduler.
 * Requires CRON_SECRET Bearer token — fails closed if unset.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await expireTrials();
    return NextResponse.json({ expired: count });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
