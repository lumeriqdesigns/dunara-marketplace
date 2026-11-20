import type { ReactNode } from "react";
import Link from "next/link";

export type LegalBlock = ReactNode | { list: ReactNode[] };
export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

function isList(b: LegalBlock): b is { list: ReactNode[] } {
  return typeof b === "object" && b !== null && "list" in b;
}

export function LegalDocument({
  eyebrow,
  title,
  effectiveDate,
  intro,
  sections,
  otherDoc,
}: {
  eyebrow: string;
  title: string;
  effectiveDate: string;
  intro: ReactNode;
  sections: LegalSection[];
  otherDoc: { href: string; label: string };
}) {
  return (
    <div className="dunara-page">
      <section className="border-b border-[var(--color-border)] bg-[#F0F4EB]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18">
          <p className="dunara-eyebrow">{eyebrow}</p>
          <h1 className="dunara-display mt-4 text-4xl font-bold text-[var(--color-ink)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-[var(--color-muted)]">Effective {effectiveDate}</p>
          <div className="legal-measure mt-6 text-base leading-8 text-[var(--color-muted)]">
            {intro}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 lg:py-16">
        <nav
          aria-label="On this page"
          className="hidden lg:sticky lg:top-[calc(var(--header-h)+1.25rem)] lg:block lg:self-start"
        >
          <p className="dunara-eyebrow">On this page</p>
          <ol className="mt-4 space-y-1.5 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-lg px-2.5 py-1.5 text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)]"
                >
                  <span className="tabular-nums text-[var(--color-muted)]">{i + 1}.</span> {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <nav aria-label="On this page" className="lg:hidden">
          <details className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
              On this page
            </summary>
            <ol className="mt-3 space-y-2 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-[var(--color-muted)] hover:text-[var(--color-primary)]">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        </nav>

        <article className="legal-measure min-w-0 rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-10">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-[calc(var(--header-h)+1.5rem)] border-b border-[var(--color-border)] py-8 first:pt-0 last:border-b-0 last:pb-0"
            >
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-4 space-y-4 text-[0.9375rem] leading-7 text-[var(--color-muted)]">
                {s.blocks.map((b, j) =>
                  isList(b) ? (
                    <ul key={j} className="list-disc space-y-2 pl-5">
                      {b.list.map((item, k) => (
                        <li key={k}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{b}</p>
                  ),
                )}
              </div>
            </section>
          ))}
          <p className="mt-10 text-sm text-[var(--color-muted)]">
            Also read our{" "}
            <Link
              href={otherDoc.href}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              {otherDoc.label}
            </Link>
            .
          </p>
        </article>
      </div>
    </div>
  );
}
