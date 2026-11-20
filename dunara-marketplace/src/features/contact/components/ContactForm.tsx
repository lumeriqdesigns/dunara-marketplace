"use client";

import { useState } from "react";
import { ArrowUpRight, Send } from "lucide-react";

const WHATSAPP_NUMBER = "2349031512760";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General enquiry");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please complete your name, email address and message.");
      return;
    }

    setError("");
    const text = [
      "Hello Dunara, I'd like to make an enquiry.",
      "",
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      `Topic: ${topic}`,
      "",
      "Message:",
      message.trim(),
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">Your name</label>
          <input id="contact-name" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ada Okafor" className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10" />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">Email address</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10" />
        </div>
      </div>

      <div>
        <label htmlFor="contact-topic" className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">What can we help with?</label>
        <select id="contact-topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10">
          <option>General enquiry</option>
          <option>Seller account or shop</option>
          <option>Pricing and subscription</option>
          <option>Verification</option>
          <option>Technical support</option>
          <option>Report a listing or safety concern</option>
          <option>Partnership or business enquiry</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">Your message</label>
        <textarea id="contact-message" name="message" required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us a little about what you need help with..." className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10" />
      </div>

      {error ? <p role="alert" className="text-sm font-medium text-[var(--color-error)]">{error}</p> : null}

      <button type="submit" className="dunara-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] sm:w-auto">
        Continue to WhatsApp <Send className="h-4 w-4" />
      </button>
      <p className="text-xs leading-5 text-[var(--color-muted)]">Your message will open in WhatsApp for you to review and send. This form does not submit or store messages on this website.</p>
    </form>
  );
}
