"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { draftAiReply, type AiUsageSnapshot } from "@/features/ai/actions";

type Props = {
  initialUsage: AiUsageSnapshot;
  onUsageChange?: (usage: AiUsageSnapshot) => void;
};

export function ReplyDraftForm({ initialUsage, onUsageChange }: Props) {
  const [context, setContext] = useState("");
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState("");
  const [usage, setUsage] = useState(initialUsage);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const exhausted = usage.limit !== -1 && usage.replyCount >= usage.limit;

  function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (exhausted) {
      toast.error("Monthly reply limit reached.");
      return;
    }
    startTransition(async () => {
      const result = await draftAiReply({
        customerContext: context,
        sellerNotes: notes || undefined,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setDraft(result.data!.draft);
      setUsage(result.data!.usage);
      onUsageChange?.(result.data!.usage);
      toast.success("Draft ready — review before sending on WhatsApp.");
    });
  }

  async function copyDraft() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      toast.success("Copied. Paste into WhatsApp.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select the text manually.");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onGenerate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-context">What did the customer say or ask?</Label>
          <Textarea
            id="customer-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Customer asked if the blue dress is available in size 14 and how long delivery takes to Abuja."
            maxLength={2000}
            rows={4}
            required
            disabled={pending || exhausted}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seller-notes">Facts the AI should use (optional)</Label>
          <Textarea
            id="seller-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Size 14 is in stock. Delivery to Abuja is 2–4 days. Price is ₦18,000."
            maxLength={1000}
            rows={3}
            disabled={pending || exhausted}
          />
          <p className="text-xs text-[var(--color-muted)]">
            Only include facts you confirm. The AI will not invent stock, prices, or payment status.
          </p>
        </div>
        <Button type="submit" disabled={pending || exhausted || !usage.configured}>
          {pending ? "Generating…" : "Generate reply draft"}
        </Button>
      </form>

      {draft ? (
        <div className="space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] p-4">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="draft-output">Draft (edit before sending)</Label>
            <Button type="button" variant="outline" size="sm" onClick={copyDraft} className="gap-1.5">
              {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea
            id="draft-output"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="bg-white"
          />
          <p className="text-xs text-[var(--color-muted)]">
            Dunara never sends this message. You copy it into WhatsApp yourself.
          </p>
        </div>
      ) : null}
    </div>
  );
}
