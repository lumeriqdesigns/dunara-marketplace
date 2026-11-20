import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldBase } from "./field-styles";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(fieldBase, "flex h-12 px-4 py-2 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
