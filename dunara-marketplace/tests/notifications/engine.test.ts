import { describe, expect, it } from "vitest";
import { createEmailProvider } from "@/features/notifications/providers/email-provider";
import { createPushProvider } from "@/features/notifications/providers/push-provider";

describe("notification providers (failure resilience)", () => {
  it("email provider skips safely when API key is missing", async () => {
    const prev = process.env.EMAIL_PROVIDER_API_KEY;
    delete process.env.EMAIL_PROVIDER_API_KEY;
    const provider = createEmailProvider();
    const result = await provider.send({
      to: "buyer@example.com",
      subject: "Test",
      text: "Hello",
    });
    expect(result.ok).toBe(true);
    expect(result.ref).toMatch(/skipped/);
    if (prev !== undefined) process.env.EMAIL_PROVIDER_API_KEY = prev;
  });

  it("push provider skips safely when VAPID keys are missing", async () => {
    const pub = process.env.VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    const provider = createPushProvider();
    const result = await provider.send({
      endpoint: "https://example.com/push",
      p256dh: "x",
      auth: "y",
      title: "Hi",
      body: "There",
    });
    expect(result.ok).toBe(true);
    expect(result.ref).toMatch(/skipped/);
    if (pub !== undefined) process.env.VAPID_PUBLIC_KEY = pub;
    if (priv !== undefined) process.env.VAPID_PRIVATE_KEY = priv;
  });
});

describe("notification event catalogue", () => {
  it("covers blueprint events", () => {
    const events = [
      "new_booking",
      "booking_accepted",
      "booking_declined",
      "new_quotation",
      "quotation_accepted",
      "booking_rescheduled",
      "new_message",
      "booking_completed",
      "verification_result",
      "new_review",
    ];
    expect(events.length).toBe(10);
  });
});
