import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Full-width form submit with a spinner while pending. */
export function SubmitButton({
  pending,
  disabled,
  idleLabel,
  pendingLabel,
}: {
  pending: boolean;
  disabled?: boolean;
  idleLabel: string;
  pendingLabel: string;
}) {
  return (
    <Button type="submit" size="lg" disabled={pending || disabled} className="w-full">
      {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
