import { createClient } from "@/lib/supabase/server";
import type { ConversationSummary, MessageRow } from "./types";

/**
 * List conversations for the current user with unread counts and peer name.
 * Uses batched queries instead of N+1 per conversation.
 */
export async function listConversationsForUser(
  userId: string,
  limit = 40
): Promise<{ data: ConversationSummary[]; error: string | null }> {
  const supabase = await createClient();

  const { data: memberships, error } = await supabase
    .from("conversation_members")
    .select(
      `
      conversation_id,
      last_read_at,
      conversations (
        id,
        subject,
        booking_id,
        last_message_at,
        updated_at
      )
    `
    )
    .eq("user_id", userId)
    .limit(limit);

  if (error) return { data: [], error: error.message };
  if (!memberships?.length) return { data: [], error: null };

  const conversationIds = memberships
    .map((m) => {
      const c = m.conversations as unknown as { id: string } | null;
      return c?.id;
    })
    .filter((id): id is string => Boolean(id));

  if (conversationIds.length === 0) return { data: [], error: null };

  const { data: allMembers } = await supabase
    .from("conversation_members")
    .select("conversation_id, user_id, profiles(display_name)")
    .in("conversation_id", conversationIds)
    .neq("user_id", userId);

  const peerByConversation = new Map<
    string,
    { user_id: string; display_name: string | null }
  >();
  for (const row of allMembers ?? []) {
    const profiles = row.profiles as unknown as { display_name: string | null } | null;
    if (!peerByConversation.has(row.conversation_id)) {
      peerByConversation.set(row.conversation_id, {
        user_id: row.user_id,
        display_name: profiles?.display_name ?? null,
      });
    }
  }

  const { data: recentMessages } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, created_at")
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(500);

  const lastReadByConversation = new Map<string, string>();
  for (const m of memberships) {
    const c = m.conversations as unknown as { id: string } | null;
    if (c?.id) {
      lastReadByConversation.set(
        c.id,
        m.last_read_at ? new Date(m.last_read_at).toISOString() : "1970-01-01T00:00:00.000Z"
      );
    }
  }

  const unreadByConversation = new Map<string, number>();
  for (const msg of recentMessages ?? []) {
    const lastRead = lastReadByConversation.get(msg.conversation_id) ?? "1970-01-01T00:00:00.000Z";
    if (msg.created_at > lastRead) {
      unreadByConversation.set(
        msg.conversation_id,
        (unreadByConversation.get(msg.conversation_id) ?? 0) + 1
      );
    }
  }

  const summaries: ConversationSummary[] = [];
  for (const m of memberships) {
    const c = m.conversations as unknown as {
      id: string;
      subject: string | null;
      booking_id: string | null;
      last_message_at: string | null;
      updated_at: string;
    } | null;
    if (!c) continue;

    const peer = peerByConversation.get(c.id);
    summaries.push({
      id: c.id,
      subject: c.subject,
      booking_id: c.booking_id,
      last_message_at: c.last_message_at,
      updated_at: c.updated_at,
      unread_count: unreadByConversation.get(c.id) ?? 0,
      other_display_name: peer?.display_name ?? null,
    });
  }

  summaries.sort((a, b) => {
    const ta = a.last_message_at ? Date.parse(a.last_message_at) : 0;
    const tb = b.last_message_at ? Date.parse(b.last_message_at) : 0;
    return tb - ta;
  });

  return { data: summaries, error: null };
}

/**
 * Load messages for a conversation the user is a member of.
 */
export async function listMessages(
  conversationId: string,
  limit = 100
): Promise<{ data: MessageRow[]; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      conversation_id,
      sender_id,
      body,
      is_system,
      created_at,
      edited_at,
      deleted_at,
      profiles:sender_id ( display_name )
    `
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) return { data: [], error: error.message };

  const rows: MessageRow[] = (data ?? []).map((row) => {
    const profiles = row.profiles as unknown as { display_name: string | null } | null;
    return {
      id: row.id,
      conversation_id: row.conversation_id,
      sender_id: row.sender_id,
      body: row.deleted_at ? null : row.body,
      is_system: row.is_system,
      created_at: row.created_at,
      edited_at: row.edited_at,
      deleted_at: row.deleted_at,
      sender_display_name: profiles?.display_name ?? null,
    };
  });

  return { data: rows, error: null };
}
