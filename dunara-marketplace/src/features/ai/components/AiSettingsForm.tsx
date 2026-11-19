"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateAiSettings } from "@/features/ai/actions";
import type { AiLanguage, AiPersonality } from "@/types";

const LANGUAGES: { value: AiLanguage; label: string }[] = [
  { value: "english", label: "English" },
  { value: "pidgin", label: "Nigerian Pidgin" },
];

const PERSONALITIES: { value: AiPersonality; label: string; hint: string }[] = [
  { value: "professional", label: "Professional", hint: "Clear and businesslike" },
  { value: "friendly", label: "Friendly", hint: "Approachable and casual" },
  { value: "warm", label: "Warm", hint: "Patient and reassuring" },
  { value: "persuasive", label: "Persuasive", hint: "Benefit-led, no false claims" },
  { value: "custom", label: "Custom", hint: "Your own short instructions" },
];

type Props = {
  initialLanguage: AiLanguage;
  initialPersonality: AiPersonality;
  initialCustom: string | null;
};

export function AiSettingsForm({ initialLanguage, initialPersonality, initialCustom }: Props) {
  const [language, setLanguage] = useState<AiLanguage>(initialLanguage);
  const [personality, setPersonality] = useState<AiPersonality>(initialPersonality);
  const [custom, setCustom] = useState(initialCustom ?? "");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateAiSettings({
        language,
        personality,
        customInstructions: custom,
      });
      if (result.ok) toast.success(result.message ?? "Saved");
      else toast.error(result.message);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[var(--color-ink)]">Response language</legend>
        <p className="text-xs text-[var(--color-muted)]">
          Applies to AI guide answers and reply drafts. The rest of Dunara stays in English.
        </p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLanguage(opt.value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                language === opt.value
                  ? "border-[var(--color-primary)] bg-[var(--color-soft-green)] text-[var(--color-primary)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-primary)]"
              }`}
              aria-pressed={language === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[var(--color-ink)]">Reply personality</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PERSONALITIES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPersonality(opt.value)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                personality === opt.value
                  ? "border-[var(--color-primary)] bg-[var(--color-soft-green)]"
                  : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]"
              }`}
              aria-pressed={personality === opt.value}
            >
              <span className="font-medium text-[var(--color-ink)]">{opt.label}</span>
              <span className="mt-0.5 block text-xs text-[var(--color-muted)]">{opt.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {personality === "custom" ? (
        <div className="space-y-2">
          <Label htmlFor="custom-instructions">Custom instructions</Label>
          <Textarea
            id="custom-instructions"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={500}
            placeholder="e.g. Keep replies short. Always mention that prices include delivery within Lagos."
            rows={3}
          />
          <p className="text-xs text-[var(--color-muted)]">
            {custom.length}/500 · Do not include secrets or customer private data.
          </p>
        </div>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save preferences"}
      </Button>
    </form>
  );
}
