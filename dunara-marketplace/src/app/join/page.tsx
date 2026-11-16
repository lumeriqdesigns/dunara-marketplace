import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Become a provider",
  description: `Offer your services on ${brand.name}. Activate seller tools, publish listings, and connect with customers.`
};

const steps = [
  {
    n: "1",
    title: "Create a free account",
    text: "Register as a normal user. Every account can browse as a buyer and later offer services."
  },
  {
    n: "2",
    title: "Activate seller tools",
    text: "From your seller workspace, turn on the seller role. Buyer access stays available."
  },
  {
    n: "3",
    title: "Set up your business profile",
    text: "Add your business name, areas you serve, and what you do. This powers your public page."
  },
  {
    n: "4",
    title: "Publish a service listing",
    text: "Draft and publish at least one service so customers can find you in search."
  },
  {
    n: "5",
    title: "Optional: request verification",
    text: "Submit documents for staff review. Badges only appear after approval — never self-assigned."
  }
];

export default function JoinPage() {
  return (
    <>
      <SiteHeader />
      <main className="ftp-join">
        <section className="ftp-join-hero">
          <div className="container">
            <p className="eyebrow">For skilled professionals</p>
            <h1>Offer your services on {brand.shortName}</h1>
            <p className="ftp-join-lead">
              Put your work in front of people looking for what you do. Manage
              enquiries, bookings, and messages in one place. Customers arrange
              payment with you directly — {brand.shortName} does not process
              payments in this version.
            </p>
            <div className="ftp-join-cta">
              <Link href="/register" className="button button-primary">
                Create account
              </Link>
              <Link href="/seller/dashboard" className="button button-secondary">
                Open seller workspace
              </Link>
            </div>
          </div>
        </section>

        <section className="container ftp-join-steps">
          <h2>How to get started</h2>
          <ol className="ftp-step-list">
            {steps.map((s) => (
              <li key={s.n} className="ftp-step">
                <span className="ftp-step-n">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="container ftp-join-note">
          <h2>What to expect</h2>
          <ul>
            <li>No listing fees in this early version.</li>
            <li>Verification is reviewed by staff and is optional to start listing.</li>
            <li>Ratings come only from completed bookings — not purchased reviews.</li>
            <li>
              You remain responsible for the quality of your work and for agreeing
              payment terms with customers.
            </li>
          </ul>
          <p className="muted small">{brand.attribution}</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
