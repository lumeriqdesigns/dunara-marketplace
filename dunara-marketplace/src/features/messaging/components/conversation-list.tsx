import Link from "next/link";
import type { ConversationSummary } from "@/features/messaging/lib/types";

type Props = {
  conversations: ConversationSummary[];
  basePath: "/buyer/messages" | "/seller/messages";
};

export function ConversationList({ conversations, basePath }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="msg-empty">
        <h2>No conversations yet</h2>
        <p>
          Start one from a booking or provider profile. Messages stay private
          between participants.
        </p>
      </div>
    );
  }

  return (
    <ul className="msg-inbox">
      {conversations.map((c) => (
        <li key={c.id}>
          <Link href={`${basePath}/${c.id}`} className="msg-inbox-item">
            <div className="msg-inbox-avatar" aria-hidden="true">
              {(c.other_display_name ?? c.subject ?? "C")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="msg-inbox-body">
              <div className="msg-inbox-top">
                <strong className="msg-inbox-name">
                  {c.other_display_name ?? c.subject ?? "Conversation"}
                </strong>
                <time className="msg-inbox-time">
                  {c.last_message_at
                    ? new Date(c.last_message_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "—"}
                </time>
              </div>
              {c.subject && c.other_display_name && (
                <p className="msg-inbox-subject">{c.subject}</p>
              )}
              <p className="msg-inbox-preview">
                {c.last_message_at ? "Open thread" : "No messages yet"}
              </p>
            </div>
            {c.unread_count > 0 && (
              <span className="msg-unread-badge">
                {c.unread_count > 99 ? "99+" : c.unread_count}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
