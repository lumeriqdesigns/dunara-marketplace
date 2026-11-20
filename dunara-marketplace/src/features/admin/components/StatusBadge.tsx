import { Badge } from "@/components/ui/badge";

export function StatusBadge({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  const map: Record<typeof tone, string> = {
    neutral: "bg-[var(--color-canvas)] text-[var(--color-muted)] border-[var(--color-border)]",
    success: "bg-[var(--color-soft-green)] text-[var(--color-primary)] border-transparent",
    warning: "bg-amber-50 text-[var(--color-warning)] border-amber-100",
    danger: "bg-red-50 text-[var(--color-error)] border-red-100",
    info: "bg-sky-50 text-sky-800 border-sky-100",
  };
  return (
    <Badge className={`border font-medium ${map[tone]}`} variant="outline">
      {children}
    </Badge>
  );
}

export function publishedBadge(published: boolean) {
  return published ? (
    <StatusBadge tone="success">Published</StatusBadge>
  ) : (
    <StatusBadge tone="neutral">Unpublished</StatusBadge>
  );
}

export function suspendedBadge(suspended: boolean) {
  return suspended ? (
    <StatusBadge tone="danger">Suspended</StatusBadge>
  ) : (
    <StatusBadge tone="success">Active</StatusBadge>
  );
}

export function verificationBadge(status: string) {
  switch (status) {
    case "verified":
      return <StatusBadge tone="success">Verified</StatusBadge>;
    case "pending":
      return <StatusBadge tone="warning">Pending</StatusBadge>;
    case "rejected":
      return <StatusBadge tone="danger">Rejected</StatusBadge>;
    default:
      return <StatusBadge tone="neutral">None</StatusBadge>;
  }
}

export function subscriptionBadge(status: string) {
  switch (status) {
    case "active":
      return <StatusBadge tone="success">Active</StatusBadge>;
    case "trialing":
      return <StatusBadge tone="info">Trialing</StatusBadge>;
    case "past_due":
      return <StatusBadge tone="warning">Past due</StatusBadge>;
    case "cancelled":
      return <StatusBadge tone="neutral">Cancelled</StatusBadge>;
    default:
      return <StatusBadge tone="neutral">Free</StatusBadge>;
  }
}
