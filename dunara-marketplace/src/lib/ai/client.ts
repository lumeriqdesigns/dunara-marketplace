/**
 * OpenAI-compatible chat client for Dunara AI assistant.
 * Server-only. Uses AI_PROVIDER_API_KEY and optional AI_PROVIDER_BASE_URL / AI_PROVIDER_MODEL.
 */
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionResult =
  | { ok: true; content: string; model: string }
  | { ok: false; error: string; code?: "config" | "timeout" | "provider" | "empty" };

const DEFAULT_BASE = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 45_000;
const MAX_OUTPUT_TOKENS = 600;

function getConfig(): { apiKey: string; baseUrl: string; model: string } | null {
  const apiKey = process.env.AI_PROVIDER_API_KEY?.trim();
  if (!apiKey) return null;
  const baseUrl = (process.env.AI_PROVIDER_BASE_URL?.trim() || DEFAULT_BASE).replace(/\/$/, "");
  const model = process.env.AI_PROVIDER_MODEL?.trim() || DEFAULT_MODEL;
  return { apiKey, baseUrl, model };
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_PROVIDER_API_KEY?.trim());
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<ChatCompletionResult> {
  const config = getConfig();
  if (!config) {
    return {
      ok: false,
      error: "AI assistant is not configured. Set AI_PROVIDER_API_KEY on the server.",
      code: "config",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: options?.temperature ?? 0.6,
        max_tokens: options?.maxTokens ?? MAX_OUTPUT_TOKENS,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `AI provider returned ${res.status}. Try again shortly.`,
        code: "provider",
      };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };

    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
      return { ok: false, error: "AI returned an empty response.", code: "empty" };
    }

    return { ok: true, content, model: data.model ?? config.model };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "AI request timed out. Please try again.", code: "timeout" };
    }
    return { ok: false, error: "Could not reach the AI provider. Please try again.", code: "provider" };
  } finally {
    clearTimeout(timer);
  }
}
