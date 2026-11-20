export function FormFieldError({ messages, id }: { messages?: string[]; id?: string }) {
  if (!messages?.length) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-[var(--color-error)]" role="alert">
      {messages[0]}
    </p>
  );
}
