import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { getAiSettings } from "@/features/ai/actions";
import { UsageMeter } from "@/features/ai/components/UsageMeter";
import { AiSettingsForm } from "@/features/ai/components/AiSettingsForm";
import { ReplyDraftForm } from "@/features/ai/components/ReplyDraftForm";
import { GuidePanel } from "@/features/ai/components/GuidePanel";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/features/seller/components/PageHeader";

export const metadata = {
  title: "AI Assistant · Dunara",
  description: "Seller guide and WhatsApp reply drafts",
};

export default async function SellerAiPage() {
  const user = await requireUser("/seller/ai");
  const shop = await getOwnShop(user.id);

  if (!shop) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={<Sparkles aria-hidden="true" />}
          title="Create a shop first"
          description="The AI assistant helps you set up your shop and draft replies. Start by creating your shop profile."
        />
        <div className="flex justify-center">
          <Link
            href="/seller/shop"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
          >
            Create shop
          </Link>
        </div>
      </div>
    );
  }

  const result = await getAiSettings();
  if (!result.ok || !result.data) {
    return (
      <EmptyState
        title="Couldn’t load the AI assistant"
        description={result.message ?? "Try again in a moment."}
      />
    );
  }

  const { settings, usage } = result.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Get help with shop setup and draft WhatsApp replies. You always review and copy messages yourself. Dunara never sends messages or connects to WhatsApp on your behalf."
      />

      <UsageMeter usage={usage} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">Draft a reply</h2>
          <p className="text-xs text-[var(--color-muted)]">
            Paste what the buyer said, add any facts they need to know, then copy the draft into
            WhatsApp.
          </p>
          <ReplyDraftForm initialUsage={usage} />
        </section>

        <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">Seller guide</h2>
          <p className="text-xs text-[var(--color-muted)]">
            Ask how to complete your profile, listings, billing, or verification. Guide answers do
            not use your reply quota.
          </p>
          <GuidePanel configured={usage.configured} />
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-base font-semibold text-[var(--color-ink)]">Language and personality</h2>
        <p className="mt-1 mb-4 text-xs text-[var(--color-muted)]">
          Defaults for drafts and guide answers. You can change them anytime.
        </p>
        <AiSettingsForm
          initialLanguage={settings.language}
          initialPersonality={settings.personality}
          initialCustom={settings.custom_instructions}
        />
      </section>
    </div>
  );
}
