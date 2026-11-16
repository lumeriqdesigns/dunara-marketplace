import type { MessageRow } from "@/features/messaging/lib/types";
import { MessageComposer } from "./message-composer";

type Props = {
  conversationId: string;
  messages: MessageRow[];
  currentUserId: string;
  title?: string;
};

export function MessageThread({
  conversationId,
  messages,
  currentUserId,
  title
}: Props) {
  return (
    <div className="msg-thread">
      {title && (
        <header className="msg-thread-header">
          <h2>{title}</h2>
        </header>
      )}

      <div className="msg-thread-scroll">
        {messages.length === 0 && (
          <p className="msg-thread-empty">No messages yet. Say hello.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          const deleted = Boolean(m.deleted_at);
          return (
            <div
              key={m.id}
              className={`msg-bubble-row ${mine ? "is-mine" : "is-theirs"}`}
            >
              <div
                className={`msg-bubble ${mine ? "msg-bubble-mine" : "msg-bubble-theirs"}${
                  deleted ? " is-deleted" : ""
                }${m.is_system ? " is-system" : ""}`}
              >
                {!mine && m.sender_display_name && (
                  <span className="msg-bubble-author">
                    {m.sender_display_name}
                  </span>
                )}
                <p className="msg-bubble-text">
                  {deleted ? "This message was removed." : m.body}
                </p>
                <time className="msg-bubble-time">
                  {new Date(m.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                  {m.edited_at ? " · edited" : ""}
                </time>
              </div>
            </div>
          );
        })}
      </div>

      <MessageComposer conversationId={conversationId} />
    </div>
  );
}
