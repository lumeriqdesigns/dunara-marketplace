import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Filled lime chip shown on shops and listings that passed Dunara's manual review. */
export function VerifiedChip({ className }: { className?: string }) {
  return (
    <span
      title="Dunara manually reviewed this seller’s application"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-lime)] py-0.5 pl-1.5 pr-2 text-[10px] font-bold leading-4 text-[#173D2D]",
        className
      )}
    >
      <BadgeCheck aria-hidden="true" className="size-3" />
      Verified
    </span>
  );
}
