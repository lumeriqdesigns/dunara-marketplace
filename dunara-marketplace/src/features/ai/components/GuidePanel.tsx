"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { askAiGuide } from "@/features/ai/actions";

const CONTEXTS = [
  { value: "general", label: "General" },
  { value: "shop", label: "Shop profile" },
  { value: "listings", label: "Listings" },
  { value: "billing", label: "Billing" },
  { value: "verification", label: "Verification" },
  { value: "registration", label: "Registration" },
] as const;

type Props = { configured: boolean };

export function GuidePanel({ configured }: Props) {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState<(typeof CONTEXTS)[number]["value"]>("general");
  const [answer, setAnswer] = useState("");
  const [pending, startTransition] = useTransition();

  function onAsk(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await askAiGuide({ question, context });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setAnswer(result.data!.answer);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onAsk} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="guide-context">Topic</Label>
          <div className="flex flex-wrap gap-2">
            {CONTEXTS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setContext(c.value)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  context === c.value
                    ? "border-[var(--color-primary)] bg-[var(--color-soft-green)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-white text-[var(--color-ink)]"
                }`}
                aria-pressed={context === c.value}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="guide-question">Your question</Label>
          <Textarea
            id="guide-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What should I write in my shop bio?"
            maxLength={800}
            rows={3}
            required
            disabled={pending || !configured}
          />
        </div>
        <Button type="submit" disabled={pending || !configured} variant="secondary">
          {pending ? "Thinking…" : "Ask guide"}
        </Button>
      </form>
      {answer ? (
        <div
          className="rounded-lg border border-[var(--color-border)] bg-white p-4 text-sm leading-relaxed text-[var(--color-ink)] whitespace-pre-wrap"
          role="status"
        >
          {answer}
        </div>
      ) : null}
    </div>
  );
}
