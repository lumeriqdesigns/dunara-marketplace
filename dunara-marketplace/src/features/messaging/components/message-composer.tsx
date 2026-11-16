"use client";

import { useState, useTransition } from "react";
import { sendMessage } from "@/features/messaging/actions/messaging-actions";

type Props = {
  conversationId: string;
};

export function MessageComposer({ conversationId }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="msg-composer"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await sendMessage(formData);
          if (!result.ok) {
            setError(result.error ?? "Could not send message.");
            return;
          }
          const form = document.getElementById(
            `msg-composer-${conversationId}`
          ) as HTMLFormElement | null;
          form?.reset();
        });
      }}
      id={`msg-composer-${conversationId}`}
    >
      <input type="hidden" name="conversation_id" value={conversationId} />
      <label className="sr-only" htmlFor={`body-${conversationId}`}>
        Message
      </label>
      <textarea
        id={`body-${conversationId}`}
        name="body"
        rows={3}
        required
        maxLength={8000}
        placeholder="Write a message…"
        className="msg-composer-input"
        disabled={pending}
      />
      {error && <p className="msg-error">{error}</p>}
      <div className="msg-composer-actions">
        <span className="msg-composer-hint">Keep it clear and respectful.</span>
        <button
          type="submit"
          disabled={pending}
          className="button button-primary button-sm"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
