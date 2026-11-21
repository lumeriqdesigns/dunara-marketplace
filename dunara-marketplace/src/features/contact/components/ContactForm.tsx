"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
          <Label htmlFor="contact-name" className="mb-2 block">
            Your name
          </Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ada Okafor"
          />
        </div>
        <div>
          <Label htmlFor="contact-email" className="mb-2 block">
            Email address
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-topic" className="mb-2 block">
          What can we help with?
        </Label>
        <Select
          id="contact-topic"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option>General enquiry</option>
          <option>Seller support</option>
          <option>Billing & plans</option>
          <option>Verification</option>
          <option>Report a problem</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="contact-message" className="mb-2 block">
          Message
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a little about what you need help with..."
          className="min-h-[140px]"
        />
      </div>

      {error ? <p className="text-sm font-medium text-[var(--color-error)]">{error}</p> : null}

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Continue to WhatsApp <Send className="h-4 w-4" />
      </Button>
      <p className="text-xs leading-5 text-[var(--color-ink-soft)]">
        Your message will open in WhatsApp for you to review and send. This form does not submit or
        store messages on this website.
      </p>
    </form>
  );
}
