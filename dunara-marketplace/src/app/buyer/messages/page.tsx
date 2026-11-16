import { BuyerPageHeader } from "@/features/buyer/components/buyer-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBuyerContext } from "@/features/buyer/lib/context";
import { listConversationsForUser } from "@/features/messaging/lib/queries";
import { ConversationList } from "@/features/messaging/components/conversation-list";

export const metadata: Metadata = { title: "Messages — Dúnarà Marketplace" };

export default async function BuyerMessagesPage() {
  const ctx = await getBuyerContext();
  if (!ctx?.user) redirect("/login?next=/buyer/messages");

  const { data: conversations, error } = await listConversationsForUser(ctx.user.id);

  return (
    <main className="buy-page">
      <BuyerPageHeader
        title="Messages"
        description="Conversations with providers."
      />
      {error && <p className="buy-banner-error">{error}</p>}
      <ConversationList conversations={conversations} basePath="/buyer/messages" />
    </main>
  );
}
