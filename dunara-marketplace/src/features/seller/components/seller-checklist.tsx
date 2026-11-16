import Link from "next/link";

const items = [
  { title: "Complete your business profile", href: "/seller/profile", label: "Profile" },
  { title: "Add service areas", href: "/seller/areas", label: "Areas" },
  { title: "Publish your first listing", href: "/seller/listings/new", label: "New listing" },
  { title: "Respond to enquiries and bookings", href: "/seller/bookings", label: "Bookings" },
  { title: "Optional: submit verification", href: "/seller/verification", label: "Verification" }
];

export function SellerChecklist() {
  return (
    <section className="ftp-checklist sel-panel">
      <h2>First steps as a seller</h2>
      <p className="sel-muted">
        Customers find you through your profile and published listings. Payment
        is agreed directly with them.
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
