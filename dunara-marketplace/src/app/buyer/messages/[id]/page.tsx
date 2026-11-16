import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getBuyerContext } from "@/features/buyer/lib/context";
import { listMessages } from "@/features/messaging/lib/queries";
import { markConversationRead } from "@/features/messaging/actions/messaging-actions";
import { MessageThread } from "@/features/messaging/components/message-thread";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Conversation — Dúnarà Marketplace" };

type Props = { params: Promise<{ id: string }> };

export default async function BuyerConversationPage({ params }: Props) {
  const { id } = await params;
  const ctx = await getBuyerContext();
  if (!ctx?.user) redirect(`/login?next=/buyer/messages/${id}`);

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
    <main className="buy-page">
      <div className="msg-back">
        <Link href="/buyer/messages">← All conversations</Link>
      </div>
      {error && <p className="buy-banner-error">{error}</p>}
      <MessageThread
        conversationId={id}
        messages={messages}
        currentUserId={ctx.user.id}
        title={conversation?.subject ?? "Conversation"}
      />
    </main>
  );
}
