import { redirect } from "next/navigation";

/** Legacy path — redirect to the canonical login route. */
export default function SignInRedirect() {
  redirect("/login");
}
