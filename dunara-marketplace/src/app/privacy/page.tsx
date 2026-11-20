import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { legal } from "@/config/legal";
import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${brand.name} collects, uses, shares and protects personal data under the Nigeria Data Protection Act 2023, and the rights you have.`,
  alternates: { canonical: "/privacy" },
};

const sections: LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    blocks: [
      `Dunara is operated by ${legal.operatorName} (${legal.registrationNumber}), ${legal.registeredAddress}. For the personal data described in this policy, we are the “data controller” (the party that decides why and how personal data is used).`,
      `Data protection contact: ${legal.dpoName}, ${legal.privacyEmail}.`,
    ],
  },
  {
    id: "law",
    title: "The law that applies",
    blocks: [
      "We collect and use personal data in line with the laws of the Federal Republic of Nigeria, in particular:",
      {
        list: [
          "the Nigeria Data Protection Act 2023 (“NDPA”), which is the main data-protection law and is enforced by the Nigeria Data Protection Commission (“NDPC”);",
          "the NDPC’s implementing instruments, including the General Application and Implementation Directive and, to the extent they continue to apply, the Nigeria Data Protection Regulation 2019 and its implementation framework;",
          "the Constitution of the Federal Republic of Nigeria 1999 (as amended), which protects the privacy of citizens;",
          "the Cybercrimes (Prohibition, Prevention, etc.) Act 2015 (as amended), which governs data retention and the protection of computer data and systems; and",
          "the Federal Competition and Consumer Protection Act 2018, which protects consumers’ interests.",
        ],
      },
      "If you use Dunara from outside Nigeria, the data protection laws of your location may also apply to you.",
    ],
  },
  {
    id: "collect",
    title: "What personal data we collect",
    blocks: [
      "What we collect depends on how you use Dunara.",
      {
        list: [
          <>
            <strong className="text-[var(--color-ink)]">Account data</strong> (sellers): full name, email address, phone number, password (stored in hashed form by our authentication provider, never in plain text), and optional profile photo.
          </>,
          <>
            <strong className="text-[var(--color-ink)]">Shop and listing data</strong> (sellers): shop name, description, logo, category, business phone and email, state and city, social-media and website links, and listing titles, descriptions, prices and photographs. Shop and listing information that you publish is public by design and can be seen by anyone, including search engines.
          </>,
          <>
            <strong className="text-[var(--color-ink)]">Verification documents</strong> (sellers who apply): photographs or PDFs of a government-issued ID and/or business registration documents, and any note you submit. These may contain sensitive personal data such as your photograph, date of birth and ID numbers. Each file must be no more than 1MB. They are stored in a private storage area and are visible only to authorised Dunara administrators.
          </>,
          <>
            <strong className="text-[var(--color-ink)]">Billing data</strong> (sellers on paid plans): your plan, subscription status, billing period dates, and the customer and subscription references and payment events sent to us by Paystack. We do not receive or store your full card number, CVV or card PIN; these are handled by Paystack.
          </>,
          <>
            <strong className="text-[var(--color-ink)]">AI assistant data</strong> (sellers): your AI language and tone settings, any custom instructions, the text you type into the assistant (such as what a customer asked), and usage counts. See section 6.
          </>,
          <>
            <strong className="text-[var(--color-ink)]">Messages to us</strong>: information you give when you use our contact form or message us by email or WhatsApp, including your name, contact details and message.
          </>,
          <>
            <strong className="text-[var(--color-ink)]">Technical and security data</strong>: IP address, device and browser type, pages visited, timestamps, session and security cookies, and error and rate-limiting logs that our systems and hosting provider generate automatically.
          </>,
          <>
            <strong className="text-[var(--color-ink)]">Administrative records</strong>: where an administrator suspends, restores or reviews a shop, listing or verification request, we keep an audit log of the action, the reason and who took it.
          </>,
        ],
      },
      "Buyers can browse Dunara without an account, and we do not ask buyers for their name or contact details. When a buyer taps “Chat on WhatsApp”, the conversation takes place on WhatsApp and is not seen or stored by Dunara. WhatsApp (Meta) will process that data under its own privacy policy.",
      "We do not knowingly collect special categories of personal data (such as health, religion or biometric data) other than what may appear on identity documents you choose to upload for verification.",
    ],
  },
  {
    id: "why",
    title: "How we use your data, and our lawful bases",
    blocks: [
      "The NDPA requires us to have a lawful basis for each use of personal data. We rely on the following:",
      {
        list: [
          "Contract. To create and manage your account and shop, publish your listings, provide the features of your plan, and process subscriptions.",
          "Legitimate interests. To keep the Platform secure and prevent fraud and abuse, review and moderate shops and listings, verify sellers, give customer support, measure and improve performance, and enforce our Terms. We balance these interests against your rights and freedoms.",
          "Legal obligation. To keep records, respond to lawful requests by courts, regulators and law-enforcement authorities, and comply with tax, consumer-protection and cybercrime laws.",
          "Consent. Where we ask for it, for example before we send you marketing messages, or where you choose to upload identity documents for verification. You may withdraw consent at any time (see section 12), but this will not affect processing done before then.",
        ],
      },
      "We do not sell your personal data. We do not use your data for automated decision-making that has legal or similarly significant effects on you. Verification decisions are made by a human administrator.",
    ],
  },
  {
    id: "ai",
    title: "How the AI assistant uses data",
    blocks: [
      "When you ask the AI assistant to draft a reply or answer a question, the text you enter, together with your shop name and AI settings, is sent to a third-party AI service provider to generate the response. The provider acts on our instructions as our processor.",
      {
        list: [
          "Please do not enter passwords, OTPs, bank PINs, ID numbers, or any other sensitive data into the assistant. Keep customer details to the minimum needed.",
          "We record that you used the assistant (date, action type, language, tone and success or failure) to apply your plan’s monthly limits and to prevent abuse.",
          "AI-generated text is a draft. Always review it before sending it to anyone.",
        ],
      },
      "If you include a customer’s personal data in a prompt, you are responsible for having a lawful reason to do so.",
    ],
  },
  {
    id: "share",
    title: "Who we share personal data with",
    blocks: [
      "We share personal data only where needed, with:",
      {
        list: [
          "Service providers (processors) who work under written contracts and only on our instructions: our authentication and database provider (Supabase), hosting provider (Vercel), payment processor (Paystack), the AI service provider, and email delivery services that send account emails such as confirmations and password resets.",
          "Dunara administrators, who may view shop, listing and verification information to moderate the Platform.",
          "The public, for the shop and listing information that you choose to publish.",
          "Regulators, courts, law-enforcement and government authorities, where we are legally required to or where it is necessary to protect rights, safety or property, or to prevent or detect crime.",
          "A successor or acquirer, if the business is reorganised or sold, subject to this policy continuing to protect your data.",
        ],
      },
      "We do not share your data with advertisers.",
    ],
  },
  {
    id: "transfers",
    title: "Transfers outside Nigeria",
    blocks: [
      "Some of our service providers store or process data outside Nigeria, including in the United States and the European Union. Where your personal data is transferred outside Nigeria, we make sure the transfer meets NDPA requirements, for example by relying on an adequate level of protection, appropriate contractual safeguards, or another lawful basis recognised by the NDPC, and we ask providers to apply security measures comparable to those required in Nigeria.",
      "You can ask us for details of the safeguards we rely on by contacting us.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    blocks: [
      "We use a small number of cookies and local storage that are strictly necessary to run the Platform, mainly to keep you signed in securely (session cookies set by our authentication provider) and to protect against misuse. We do not currently use advertising cookies or third-party advertising trackers.",
      "You can block or delete cookies in your browser settings, but sellers will not be able to stay signed in without them. If we add analytics or other non-essential cookies in future, we will update this policy and, where required, ask for your consent first.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep data",
    blocks: [
      "We keep personal data only for as long as needed for the purposes in this policy, or as the law requires. As a general guide:",
      {
        list: [
          "Account, shop and listing data: while your account is open, and then deleted or anonymised within a reasonable period after closure, unless we need it to resolve a dispute or comply with the law.",
          "Verification documents: while your verification is active or under review, and then deleted or restricted when no longer needed for verification, fraud prevention or legal compliance. You may ask us to delete them earlier.",
          "Billing and payment records: for the period required by tax, accounting and financial-regulation rules (generally at least six years).",
          "Security logs and administrative audit records: for a limited period needed to detect and investigate abuse, and longer where a legal obligation or investigation requires it.",
          "Support messages: for as long as is needed to deal with your request and any follow-up.",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "How we protect your data",
    blocks: [
      "We use technical and organisational measures appropriate to the risk, including encrypted connections (HTTPS), access controls and database row-level security so sellers can only access their own data, private storage for verification documents with time-limited access links, role-based administrator access with audit logging, server-side-only secret keys, verification of payment-provider webhooks, and rate limits on sensitive actions.",
      "No system is completely secure. If a personal-data breach is likely to put your rights and freedoms at risk, we will notify the NDPC within 72 hours of becoming aware of it, and will tell affected people without undue delay where there is a high risk to them. Please keep your password confidential and contact us immediately if you suspect unauthorised use of your account.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    blocks: [
      "Under the NDPA, you have the right to:",
      {
        list: [
          "be informed about how your personal data is used (this policy);",
          "access your personal data and receive a copy;",
          "correct inaccurate or incomplete data (sellers can edit most details in their account);",
          "request erasure of your data where there is no longer a lawful reason for us to keep it;",
          "restrict or object to processing, including processing based on legitimate interests and direct marketing;",
          "receive your data in a structured, commonly used, machine-readable format, and have it transferred where technically feasible (data portability);",
          "withdraw consent at any time, where processing relies on your consent;",
          "not be subject to a decision based solely on automated processing that has legal or similarly significant effects on you.",
        ],
      },
      `To use any of these rights, email ${legal.privacyEmail} or message us on WhatsApp (${legal.whatsappDisplay}). We may need to verify your identity first, and we aim to respond within one month. Some rights are subject to exceptions, for example where we must keep records to comply with the law. We will not charge a fee unless a request is manifestly unfounded or excessive.`,
    ],
  },
  {
    id: "children",
    title: "Children",
    blocks: [
      "Dunara is not intended for anyone under 18, and we do not knowingly collect personal data from children. If you believe a child has given us personal data, please contact us and we will delete it.",
    ],
  },
  {
    id: "sellers",
    title: "Sellers and buyers’ data",
    blocks: [
      "When a buyer contacts you on WhatsApp, you receive their phone number and any information they send. You are the controller of that data and are responsible for using it lawfully: only to respond to the buyer’s enquiry and complete the transaction, keeping it secure, and not sharing it or using it for unrelated marketing unless the buyer has agreed. Dunara has no access to those WhatsApp conversations.",
    ],
  },
  {
    id: "complaints",
    title: "Complaints",
    blocks: [
      `If you are unhappy with how we use your data, please contact us first at ${legal.privacyEmail} so we can try to put it right. You also have the right to lodge a complaint with the Nigeria Data Protection Commission (ndpc.gov.ng), or to seek a remedy in court.`,
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    blocks: [
      "We may update this policy as our services or the law change. We will post the new version with an updated effective date, and for material changes we will give reasonable notice, for example by email or a notice on the Platform.",
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [
      `${legal.operatorName}, ${legal.registeredAddress}. Email: ${legal.privacyEmail}. WhatsApp: ${legal.whatsappDisplay}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy policy"
      effectiveDate={legal.privacyEffectiveDate}
      intro={
        <p>
          This policy explains what personal data {brand.name} collects, why we collect it, who we share it with, how long we keep it, and the rights you have under the Nigeria Data Protection Act 2023. We keep it simple: we collect what we need to run a WhatsApp-first listing platform, and we do not sell your data.
        </p>
      }
      sections={sections}
      otherDoc={{ href: "/terms", label: "Terms of use" }}
    />
  );
}
