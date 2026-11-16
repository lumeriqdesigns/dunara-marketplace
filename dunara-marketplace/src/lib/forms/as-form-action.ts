/**
 * Adapt a server action that returns a result object so it can be used as a
 * React/Next.js <form action={...}> handler (must return void | Promise<void>).
 */
export function asFormAction(
  action: (formData: FormData) => Promise<unknown>
): (formData: FormData) => Promise<void> {
  return async (formData: FormData) => {
    await action(formData);
  };
}
