import { BadgeCheck } from "lucide-react";

type Props = {
  isVerified: boolean;
  level?: string | null;
  size?: "sm" | "md";
};

/**
 * Shows verification only when is_verified is true from the database.
 * Never invents a verified state. Does not claim Dúnarà guarantees work quality.
 */
export function VerificationBadge({ isVerified, level, size = "sm" }: Props) {
  if (!isVerified) {
    return null;
  }

  const label =
    level && level !== "basic"
      ? `Verified · ${level.replace(/_/g, " ")}`
      : "Verified";

  return (
    <span
      className={`verification-badge verification-badge-${size}`}
      title="This provider completed Dúnarà verification checks. This is not a guarantee of work quality or identity beyond those checks."
    >
      <BadgeCheck size={size === "sm" ? 14 : 18} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
