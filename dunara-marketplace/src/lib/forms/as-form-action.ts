/**
 * Preserve the original Server Action reference for use with React forms.
 *
 * Do not wrap the action in a normal function here: a normal function is not a
 * Server Action and cannot safely cross the React Server Component boundary.
 * All callers must pass an exported action from a module marked "use server".
 */
export function asFormAction(
  action: (formData: FormData) => Promise<unknown>
): (formData: FormData) => Promise<void> {
  // This is a type-only adaptation. At runtime, return the original Server
  // Action reference so Next.js can serialize it as a Server Action.
  return action as (formData: FormData) => Promise<void>;
}
