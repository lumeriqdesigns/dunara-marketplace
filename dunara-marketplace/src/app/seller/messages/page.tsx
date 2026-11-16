import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerContext } from "@/features/seller/lib/context";
import { isSeller } from "@/lib/permissions";
import { listConversationsForUser } from "@/features/messaging/lib/queries";
import { ConversationList } from "@/features/messaging/components/conversation-list";

export const metadata: Metadata = { title: "Messages — Dúnarà Marketplace" };

export default async function SellerMessagesPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/messages");
  if (!isSeller(ctx.user)) redirect("/seller/dashboard");

  const { data: conversations, error } = await listConversationsForUser(ctx.user.id);

  return (
    <main className="sel-page">
      <SellerPageHeader
        title="Messages"
        description="Conversations linked to your bookings and enquiries."
      />
      {error && <p className="sel-banner-error">{error}</p>}
      <ConversationList conversations={conversations} basePath="/seller/messages" />
    </main>
  );
}
