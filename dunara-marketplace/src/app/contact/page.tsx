import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, Clock3, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/features/contact/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Dunara",
  description: "Get in touch with the Dunara team for seller support, account questions, pricing enquiries and general assistance.",
  alternates: { canonical: "/contact" },
};

const email = "lumeriqdesigns@gmail.com";
const whatsappDisplay = "09031512760";
const whatsappUrl = "https://wa.me/2349031512760";

export default function ContactPage() {
  return (
    <div className="dunara-page">
      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[#F0F4EB]">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[#D6F36A]/35 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <p className="dunara-eyebrow">We’re here to help</p>
          <h1 className="dunara-display mt-4 max-w-3xl text-4xl font-bold text-[var(--color-ink)] sm:text-5xl lg:text-6xl">Let’s get your questions <span className="text-[var(--color-primary)]">answered.</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">Whether you’re setting up a shop, managing a subscription or need a hand using Dunara, send us a message. We’ll point you in the right direction.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-12 lg:py-20">
        <aside className="space-y-6">
          <div>
            <p className="dunara-eyebrow">Contact details</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink)]">Choose how to reach us</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">For the quickest conversation, message us on WhatsApp. You can also send an email if you prefer.</p>
          </div>

          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="group flex gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-lg">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7F4EA] text-[var(--color-primary)]"><MessageCircle className="h-6 w-6" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[var(--color-ink)]">WhatsApp</span><span className="mt-1 block text-sm text-[var(--color-muted)]">{whatsappDisplay}</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">Start a conversation <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></span>
          </a>

          <a href={`mailto:${email}`} className="group flex gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-lg">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F1F0E7] text-[var(--color-primary)]"><Mail className="h-6 w-6" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[var(--color-ink)]">Email</span><span className="mt-1 block break-all text-sm text-[var(--color-muted)]">{email}</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">Send an email <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></span>
          </a>

          <div className="rounded-2xl bg-[#173D2D] p-5 text-white">
            <div className="flex items-center gap-2 text-[#D6F36A]"><Clock3 className="h-5 w-5" /><span className="text-sm font-semibold">A quick note</span></div>
            <p className="mt-3 text-sm leading-6 text-white/75">Send us the details of your question so we can understand what you need and guide you to the right next step.</p>
          </div>

          <div className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-white/70 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
            <p className="text-xs leading-5 text-[var(--color-muted)]">Never send your password, one-time passcode or full payment card details in a support message.</p>
          </div>
        </aside>

        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
          <p className="dunara-eyebrow">Send a message</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink)]">How can we help?</h2>
          <p className="mt-2 mb-8 text-sm leading-6 text-[var(--color-muted)]">Complete the form below. We’ll prepare your message in WhatsApp so you can review and send it.</p>
          <ContactForm />
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-lg font-bold text-[var(--color-ink)]">Looking for an instant answer?</h2><p className="mt-1 text-sm text-[var(--color-muted)]">You may find what you need in our seller guide.</p></div>
          <Link href="/pricing" className="dunara-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">View pricing & seller guide <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
