import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { legal } from "@/config/legal";

export const metadata: Metadata = {
  title: "Contact Dunara",
  description:
    "Get in touch with the Dunara team for seller support, account questions, pricing enquiries and general assistance.",
  alternates: { canonical: "/contact" },
};

const whatsappUrl = "https://wa.me/2349031512760";

export default function ContactPage() {
  return (
    <div className="dunara-page">
      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[#F0F4EB]">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[#D6F36A]/35 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18">
          <p className="dunara-eyebrow">We’re here to help</p>
          <h1 className="dunara-display mt-4 max-w-3xl text-4xl font-bold text-[var(--color-ink)] sm:text-5xl">
            Let’s get your questions <span className="text-[var(--color-primary)]">answered.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
            Whether you’re setting up a shop, managing a subscription, or need a hand using Dunara,
            send us a message. We’ll point you in the right direction.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:py-20">
        {/* Form */}
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
          <p className="dunara-eyebrow">Send a message</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
            How can we help?
          </h2>
          <p className="mt-2 mb-8 text-sm leading-6 text-[var(--color-muted)]">
            Complete the form. We’ll open WhatsApp with your message so you can review and send it.
          </p>
          <ContactForm />
        </div>

        {/* Response-time + channels */}
        <aside className="space-y-5">
          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-soft-green)] text-[var(--color-primary)]">
                <Clock3 aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">Response time</p>
                <p className="text-xs text-[var(--color-muted)]">Typical weekday replies</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
              We aim to reply within <strong className="text-[var(--color-ink)]">one business day</strong>{" "}
              on WhatsApp. Email may take a little longer. Include your shop name or listing link
              when it helps.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-lg"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7F4EA] text-[var(--color-primary)]">
              <MessageCircle aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--color-ink)]">WhatsApp</span>
              <span className="mt-1 block text-sm text-[var(--color-muted)]">
                {legal.whatsappDisplay}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
                Start a conversation
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </span>
          </a>

          <a
            href={`mailto:${legal.email}`}
            className="group flex gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-lg"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7F4EA] text-[var(--color-primary)]">
              <Mail aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--color-ink)]">Email</span>
              <span className="mt-1 block break-all text-sm text-[var(--color-muted)]">
                {legal.email}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
                Send an email
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </span>
          </a>

          <div className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-warm)] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
            <p className="text-xs leading-5 text-[var(--color-muted)]">
              Never send your password, one-time passcode, or full payment card details in a support
              message.
            </p>
          </div>
        </aside>
      </section>

      <section className="border-t border-[var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Looking for an instant answer?</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              You may find what you need in our seller guide.
            </p>
          </div>
          <Link
            href="/pricing"
            className="dunara-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            View pricing & seller guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
