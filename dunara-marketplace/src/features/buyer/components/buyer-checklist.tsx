import Link from "next/link";

const items = [
  {
    title: "Browse services near you",
    href: "/services",
    label: "Find a service"
  },
  {
    title: "Save providers you like",
    href: "/buyer/favourites",
    label: "Favourites"
  },
  {
    title: "Request a booking or enquire",
    href: "/providers",
    label: "Browse providers"
  },
  {
    title: "Message and agree next steps",
    href: "/buyer/messages",
    label: "Messages"
  },
  {
    title: "After completed work, leave a review",
    href: "/buyer/reviews",
    label: "Reviews"
  }
];

export function BuyerChecklist() {
  return (
    <section className="ftp-checklist buy-panel">
      <h2>First steps as a buyer</h2>
      <p className="buy-muted">
        You pay providers directly — Dúnarà does not process payments. Follow
        these steps when you are ready.
      </p>
      <ol className="ftp-checklist-list">
        {items.map((item, i) => (
          <li key={item.href}>
            <span className="ftp-checklist-n">{i + 1}</span>
            <span className="ftp-checklist-text">{item.title}</span>
            <Link href={item.href} className="button button-secondary button-sm">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
