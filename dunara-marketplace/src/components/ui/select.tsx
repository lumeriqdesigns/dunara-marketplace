import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldBase } from "./field-styles";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Classes for the wrapper (use this for width / grid placement). */
  wrapperClassName?: string;
}

/** Native select that shares `Input`'s height, radius, hover and focus states, plus a consistent chevron. */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapperClassName, children, ...props }, ref) => (
    <div className={cn("group/select relative", wrapperClassName)}>
      <select
        ref={ref}
        className={cn(fieldBase, "h-12 cursor-pointer appearance-none pl-4 pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-soft)] transition-transform duration-200 group-focus-within/select:text-[var(--color-primary)]"
      />
    </div>
  )
);
Select.displayName = "Select";

export { Select };
