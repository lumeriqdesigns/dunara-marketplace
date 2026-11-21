"use client";

import type { FormHTMLAttributes } from "react";

/** GET form that submits as soon as a <select> inside it changes. Without JS the form's own button still works. */
export function AutoSubmitForm({ children, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      {...props}
      onChange={(e) => {
        if ((e.target as HTMLElement).tagName === "SELECT") e.currentTarget.requestSubmit();
      }}
    >
      {children}
    </form>
  );
}
