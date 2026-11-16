import Link from "next/link";

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="state-block state-loading" role="status" aria-live="polite">
      <div className="state-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyBlock({
  title,
  description,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="state-block state-empty ftp-empty">
      <p className="ftp-empty-eyebrow">Nothing here yet</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="ftp-empty-actions">
        {actionHref && actionLabel && (
          <Link href={actionHref} className="button button-primary">
            {actionLabel}
          </Link>
        )}
        {secondaryHref && secondaryLabel && (
          <Link href={secondaryHref} className="button button-secondary">
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export function ErrorBlock({
  title = "Something went wrong",
  message
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="state-block state-error" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      <p className="muted small">
        If this continues, check that Supabase is configured and migrations are
        applied.
      </p>
    </div>
  );
}
