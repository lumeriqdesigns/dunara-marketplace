import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldBase } from "./field-styles";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(fieldBase, "flex min-h-[112px] resize-y px-4 py-3 leading-6", className)}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
export { Textarea };
