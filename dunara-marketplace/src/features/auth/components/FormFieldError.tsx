export function FormFieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1 text-sm text-[var(--color-error)]" role="alert">
      {messages[0]}
    </p>
  );
}
