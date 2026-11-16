import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { checkRateLimitAsync, RateLimits } from "@/lib/security/rate-limit";
import { mapClientError, logServerError } from "@/lib/security/errors";

/**
 * Issues a short-lived signed URL for a verification document.
 * Access is gated by provider_documents RLS (owner or officer).
 *
 * Query:
 *   id     — document UUID (required)
 *   format — "redirect" (default) | "json"
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimitAsync(
    `document:sign:${user.id}`,
    RateLimits.documentSign.limit,
    RateLimits.documentSign.windowMs
  );
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "Too many document requests. Please wait and try again.",
        retryAfterSeconds: rl.retryAfterSeconds
      },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) }
      }
    );
  }

  const documentId = req.nextUrl.searchParams.get("id");
  if (!documentId || !/^[0-9a-f-]{36}$/i.test(documentId)) {
    return NextResponse.json({ error: "Valid document id required" }, { status: 400 });
  }

  const format = req.nextUrl.searchParams.get("format") ?? "redirect";

  try {
    const supabase = await createClient();
    const { data: doc, error } = await supabase
      .from("provider_documents")
      .select("id, file_path, mime_type, file_name")
      .eq("id", documentId)
      .maybeSingle();

    if (error || !doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: signed, error: sErr } = await supabase.storage
      .from("verification-documents")
      .createSignedUrl(doc.file_path, 60 * 5);

    if (sErr || !signed?.signedUrl) {
      logServerError("verification.document.sign", sErr);
      return NextResponse.json(
        { error: "Could not create a secure link for this document." },
        { status: 500 }
      );
    }

    if (format === "json") {
      return NextResponse.json({
        url: signed.signedUrl,
        expiresInSeconds: 300,
        fileName: doc.file_name ?? null,
        mimeType: doc.mime_type ?? null
      });
    }

    // Redirect keeps existing admin UI working (anchor href)
    const res = NextResponse.redirect(signed.signedUrl);
    res.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate"
    );
    return res;
  } catch (e) {
    logServerError("verification.document", e);
    return NextResponse.json(
      { error: mapClientError(e, "Could not load document.") },
      { status: 500 }
    );
  }
}
