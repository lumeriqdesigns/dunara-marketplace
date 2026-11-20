import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { legal } from "@/config/legal";
import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `The terms that govern your use of ${brand.name}, a WhatsApp-first listing platform for Nigerian product vendors and service providers.`,
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About Dunara and these Terms",
    blocks: [
      `Dunara (“Dunara”, “we”, “us”, “our”) is a listing and discovery platform operated by ${legal.operatorName} (${legal.registrationNumber}), with its address at ${legal.registeredAddress}. Dunara lets sellers of products and services create a shop and listings, and lets buyers find them and start a conversation on WhatsApp.`,
      "These Terms of use (“Terms”) form a binding agreement between you and us when you access the website, create an account, or use any part of Dunara (together, the “Platform”). By using the Platform, or by ticking the box when you register, you confirm that you have read and accepted these Terms and our Privacy policy.",
      "If you do not agree, please do not use the Platform.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility and your account",
    blocks: [
      "You must be at least 18 years old and able to enter into a binding contract under Nigerian law to create an account. If you register on behalf of a business, you confirm that you are authorised to bind that business to these Terms.",
      "Browsing public pages does not require an account. Selling on Dunara does.",
      {
        list: [
          "Give accurate, current and complete information when you register and keep it up to date.",
          "Keep your password and any one-time codes confidential. You are responsible for activity under your account unless you tell us promptly that it has been compromised.",
          "One person or business should not operate multiple accounts to avoid listing limits, suspensions or fees.",
          "Tell us at once if you suspect unauthorised access to your account.",
        ],
      },
    ],
  },
  {
    id: "what-we-do",
    title: "What Dunara does, and does not do",
    blocks: [
      "Dunara is a discovery platform. We display seller shops and listings and provide a button that opens a WhatsApp conversation between a buyer and a seller. Any agreement for the sale of a product or the provision of a service is made directly between the buyer and the seller, off the Platform.",
      {
        list: [
          "We are not a party to any transaction between buyers and sellers.",
          "We do not process payments between buyers and sellers, hold funds, or offer escrow, delivery, insurance or dispute-resolution services for those transactions.",
          "We do not read, store or control WhatsApp messages. WhatsApp is a separate service provided by a third party under its own terms.",
          "We do not own, inspect, guarantee or endorse any listing, and we do not guarantee that any product or service exists, is lawful, is of satisfactory quality, or will be delivered.",
        ],
      },
    ],
  },
  {
    id: "buyers",
    title: "Using Dunara as a buyer",
    blocks: [
      "You are responsible for deciding whether to deal with a seller. Before paying, confirm the details, price, delivery and return arrangements directly with the seller, and read our safety tips at /safety.",
      "Do not share passwords, one-time codes or bank PINs with anyone claiming to represent Dunara. We will never ask for them.",
      "Your rights as a consumer against a seller, including under the Federal Competition and Consumer Protection Act 2018, are between you and that seller. Nothing in these Terms limits any consumer right that cannot lawfully be excluded.",
    ],
  },
  {
    id: "sellers",
    title: "Using Dunara as a seller",
    blocks: [
      "As a seller, you are solely responsible for your shop, your listings and your dealings with buyers. You confirm and agree that:",
      {
        list: [
          "you have the legal right to sell the products or provide the services you list, and hold every licence, registration or permit your trade requires (for example NAFDAC, SON, professional or sector licences);",
          "all information, descriptions, prices, photographs and contact details you post are accurate, not misleading, and show the real item or service;",
          "prices are stated in naira (₦) and any additional charges, such as delivery, are disclosed to the buyer before payment;",
          "you will honour the terms you agree with buyers and comply with all applicable laws, including consumer-protection, tax and data-protection laws;",
          "the phone number you give is a WhatsApp number you control and that you will respond to buyers courteously and honestly.",
        ],
      },
      "You must not use the Platform to collect buyers’ personal data for any purpose other than responding to their enquiry and completing the transaction they asked about, unless the law allows it and the buyer has agreed.",
    ],
  },
  {
    id: "prohibited",
    title: "Prohibited content and conduct",
    blocks: [
      "You must not use the Platform, or post any content, that:",
      {
        list: [
          "is illegal in Nigeria, including goods or services that are prohibited, counterfeit, stolen, or that require a licence you do not hold;",
          "includes weapons, narcotics, controlled drugs, human-trafficking, sexually explicit content, or content that exploits or endangers children;",
          "is fraudulent or deceptive, including advance-fee schemes, fake listings, fake reviews, impersonation, or “bait” pricing;",
          "infringes another person’s intellectual-property, privacy or other rights;",
          "is defamatory, discriminatory, hateful, threatening or harassing;",
          "contains malware, or attempts to access accounts, data or systems you are not authorised to access, or to interfere with the security or operation of the Platform;",
          "involves scraping, bulk-copying or reselling Platform data, or automated access, without our written permission;",
          "misuses the verification, subscription or AI features, or tries to avoid listing limits, fees or rate limits.",
        ],
      },
      "Conduct that amounts to an offence under Nigerian law, including the Cybercrimes (Prohibition, Prevention, etc.) Act 2015 (as amended), may be reported to the relevant authorities.",
    ],
  },
  {
    id: "verification",
    title: "Seller verification",
    blocks: [
      "Sellers may apply for a verified badge by submitting identity and/or business-registration documents. We review these documents to check that they appear to match the shop. How we use these documents is explained in our Privacy policy.",
      "Each verification document must be a photograph (JPG or PNG) or a PDF of no more than 1MB. Files larger than 1MB cannot be uploaded, so please compress or resize them before submitting.",
      "A verified badge means only that we reviewed the documents submitted at that time. It is not a guarantee of the seller’s honesty, the quality of any product or service, or the safety of any payment. We may approve, reject, or remove verification at our discretion, including where information is false, incomplete or outdated.",
    ],
  },
  {
    id: "plans",
    title: "Plans, trial and payments",
    blocks: [
      "Dunara offers a free plan and paid subscription plans for sellers. Current plans, prices, listing limits and features are shown on our pricing page and may change. A change in price will not affect a billing period you have already paid for.",
      {
        list: [
          "Free trial. A new shop may receive a short free trial of a paid plan when billing is enabled. No card is required, and the shop moves to the free plan when the trial ends unless you choose a paid plan.",
          "Payment processing. Paid subscriptions are processed by Paystack. By paying, you also agree to Paystack’s terms. We do not see or store your full card details.",
          "Renewal and cancellation. Unless stated otherwise at checkout, paid plans renew for the chosen billing period (monthly or annual) until cancelled. You can cancel at any time; cancellation takes effect at the end of the paid period and you keep paid features until then.",
          "Refunds. Except where the law requires otherwise, or where we say so in writing, amounts already paid for a billing period are not refundable. If you believe you were charged in error, contact us within 14 days at the details below and we will review it.",
          "Failed payment. If a payment fails, your plan may be downgraded and listings above the free limit may be unpublished until payment is made.",
          "Taxes. Prices are stated in naira and, where applicable, are inclusive of any taxes we are required to charge.",
          "No commission. We do not charge commission on deals that buyers and sellers arrange on WhatsApp.",
        ],
      },
    ],
  },
  {
    id: "ai",
    title: "AI assistant",
    blocks: [
      "Some plans include an AI assistant that drafts replies for sellers to use on WhatsApp and answers questions about using the Platform. The assistant is powered by a third-party AI service.",
      {
        list: [
          "Output is generated automatically and may be inaccurate, incomplete or unsuitable. You must review every draft before you use it, and you remain fully responsible for anything you send to a buyer.",
          "The assistant does not send messages for you, and is not legal, financial, tax or professional advice.",
          "Do not enter passwords, one-time codes, bank PINs, identity-document numbers or other sensitive personal data into the assistant. Limit customer details to what is needed to draft a reply.",
          "Monthly usage limits apply according to your plan, and we may apply additional fair-use and rate limits.",
        ],
      },
    ],
  },
  {
    id: "ip",
    title: "Content and intellectual property",
    blocks: [
      "The Platform, including its name, logo, design, software and text (other than user content), belongs to us or our licensors and is protected by Nigerian and international intellectual-property laws. You may not copy, modify, distribute or reverse-engineer it except as the law allows.",
      "You keep ownership of the content you post (such as logos, photographs, descriptions and prices). By posting it, you give us a worldwide, non-exclusive, royalty-free licence to host, store, reproduce, resize, display and distribute that content on and in connection with the Platform, including in search results, category pages, and promotional material for the Platform, for as long as the content is on the Platform and for a reasonable period afterwards while it is removed from our systems.",
      "To keep the Platform fast and to manage storage, each image or document you upload to Dunara (such as a logo, listing photograph, profile photo or verification document) must be no more than 1MB. Files above this size will be rejected.",
      "You confirm that you own, or have permission to use, everything you post, and that it does not infringe anyone else’s rights. If you believe content on Dunara infringes your rights, contact us with the details and we will review it promptly.",
    ],
  },
  {
    id: "moderation",
    title: "Moderation, suspension and termination",
    blocks: [
      "We may review, edit, unpublish or remove any shop, listing or content, and may suspend or close any account, with or without notice, if we reasonably believe that it breaches these Terms or the law, creates risk for buyers or for us, or is the subject of a valid complaint or legal request. Where we suspend a shop, we will usually tell you the reason unless the law or a pending investigation prevents us.",
      "You may stop using the Platform and close your account at any time through your account settings or by contacting us. Provisions that by their nature should survive closure (for example intellectual property, disclaimers, limitation of liability, indemnity and governing law) will continue to apply.",
    ],
  },
  {
    id: "third-parties",
    title: "Third-party services and links",
    blocks: [
      "The Platform relies on and links to third-party services such as WhatsApp, Paystack, our hosting and database providers, and seller-supplied social-media and website links. We do not control them and are not responsible for their content, availability or practices. Your use of them is governed by their own terms and privacy policies.",
    ],
  },
  {
    id: "disclaimer",
    title: "Disclaimers",
    blocks: [
      "To the fullest extent permitted by law, the Platform is provided “as is” and “as available”. We do not promise that it will be uninterrupted, error-free or secure, that listings are accurate or lawful, or that any particular result will be achieved, such as a number of buyers or sales.",
      "Nothing in these Terms excludes or limits any liability that cannot be excluded or limited under Nigerian law, including liability for death or personal injury caused by negligence, or for fraud.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    blocks: [
      "Subject to the previous section, and to the extent the law permits, we are not liable for (a) any loss arising from a transaction or dispute between a buyer and a seller; (b) the acts or omissions of any user or third party; or (c) any indirect or consequential loss, loss of profit, revenue, goodwill or data, even if we were told it was possible.",
      "Our total liability to you for all claims connected with the Platform in any 12-month period is limited to the greater of (i) the fees you paid to us in that period, and (ii) ₦50,000.",
    ],
  },
  {
    id: "indemnity",
    title: "Indemnity",
    blocks: [
      "You agree to indemnify and hold us (and our officers, employees and partners) harmless from any claim, loss, liability or expense, including reasonable legal fees, arising from your content, your breach of these Terms or the law, or your dealings with other users, except to the extent caused by our own breach or negligence.",
    ],
  },
  {
    id: "data",
    title: "Data protection",
    blocks: [
      <>
        We process personal data in accordance with the Nigeria Data Protection Act 2023 and other applicable law, as explained in our{" "}
        <Link href="/privacy" className="font-medium text-[var(--color-primary)] hover:underline">
          Privacy policy
        </Link>
        . If you, as a seller, receive a buyer’s personal data (such as a WhatsApp number or name), you are responsible for handling it lawfully and only for the purpose for which it was given.
      </>,
    ],
  },
  {
    id: "law",
    title: "Governing law and disputes",
    blocks: [
      "These Terms, and any dispute or claim connected with them or the Platform, are governed by the laws of the Federal Republic of Nigeria.",
      {
        list: [
          "Talk to us first. Please contact us and give us 30 days to try to resolve any complaint informally.",
          `Mediation and arbitration. If it is not resolved, the parties will try mediation and, failing that, any dispute will be finally settled by arbitration under the Arbitration and Mediation Act 2023, seated in ${legal.arbitrationSeat}, by a single arbitrator, in English.`,
          `Courts. Subject to the above, and for urgent relief or enforcement, the courts of ${legal.courtsLocation}, Nigeria, have jurisdiction.`,
          "Consumers. Nothing here removes your right to complain to, or seek a remedy from, a regulator or court where the law gives you that right, including the Federal Competition and Consumer Protection Commission and, for personal-data complaints, the Nigeria Data Protection Commission.",
        ],
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to these Terms",
    blocks: [
      "We may update these Terms from time to time, for example when we add features or when the law changes. We will post the updated version with a new effective date, and for material changes we will give reasonable notice, such as by email or a notice on the Platform. If you keep using the Platform after the change takes effect, you accept the updated Terms. If you do not agree, you should stop using the Platform and close your account.",
    ],
  },
  {
    id: "general",
    title: "General",
    blocks: [
      {
        list: [
          "Entire agreement. These Terms and the Privacy policy are the entire agreement between you and us about the Platform.",
          "Severability. If any part is found unenforceable, the rest remains in effect.",
          "No waiver. If we do not enforce a right immediately, we have not given it up.",
          "Assignment. You may not transfer your rights under these Terms without our consent. We may transfer ours as part of a reorganisation or sale of the business.",
          "Force majeure. We are not responsible for failure or delay caused by events beyond our reasonable control, such as power or network outages, or acts of government.",
          "Notices. We may give you notice by email, on the Platform or through WhatsApp contact details you provided.",
          "Language. These Terms are written in English; any translation is for convenience only.",
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [
      `${legal.operatorName}, ${legal.registeredAddress}. Email: ${legal.email}. WhatsApp: ${legal.whatsappDisplay}. You can also use our contact page.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of use"
      effectiveDate={legal.termsEffectiveDate}
      intro={
        <p>
          These terms explain how you may use {brand.name}, what we do and do not do, and what we expect of buyers and sellers. Please read them carefully. In short: Dunara helps people find each other, and deals happen directly between buyer and seller on WhatsApp.
        </p>
      }
      sections={sections}
      otherDoc={{ href: "/privacy", label: "Privacy policy" }}
    />
  );
}
