import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSellerContext } from "@/features/seller/lib/context";
import { isSeller } from "@/lib/permissions";
import { listMessages } from "@/features/messaging/lib/queries";
import { markConversationRead } from "@/features/messaging/actions/messaging-actions";
import { MessageThread } from "@/features/messaging/components/message-thread";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Conversation — Dúnarà Marketplace" };

type Props = { params: Promise<{ id: string }> };

export default async function SellerConversationPage({ params }: Props) {
  const { id } = await params;
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect(`/login?next=/seller/messages/${id}`);
  if (!isSeller(ctx.user)) redirect("/seller/dashboard");

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", id)
    .eq("user_id", ctx.user.id)
    .maybeSingle();

  if (!membership) notFound();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, subject")
    .eq("id", id)
    .maybeSingle();

  const { data: messages, error } = await listMessages(id);
  await markConversationRead(id);

  return (
    <main className="sel-page">
      <div className="msg-back">
        <Link href="/seller/messages">← All conversations</Link>
      </div>
      {error && <p className="sel-banner-error">{error}</p>}
      <MessageThread
        conversationId={id}
        messages={messages}
        currentUserId={ctx.user.id}
        title={conversation?.subject ?? "Conversation"}
      />
    </main>
  );
}
