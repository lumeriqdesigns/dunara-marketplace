import Link from "next/link";

const groups: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: "Business",
    links: [
      { href: "/seller/dashboard", label: "Overview" },
      { href: "/seller/profile", label: "Profile" },
      { href: "/seller/listings", label: "Listings" },
      { href: "/seller/areas", label: "Service areas" },
      { href: "/seller/availability", label: "Availability" },
      { href: "/seller/verification", label: "Verification" }
    ]
  },
  {
    label: "Demand",
    links: [
      { href: "/seller/enquiries", label: "Enquiries" },
      { href: "/seller/bookings", label: "Bookings" },
      { href: "/seller/messages", label: "Messages" },
      { href: "/seller/reviews", label: "Reviews" }
    ]
  },
  {
    label: "Account",
    links: [{ href: "/seller/settings", label: "Settings" }]
  }
];

export function SellerNav() {
  return (
    <nav className="sel-nav" aria-label="Seller dashboard">
      {groups.map((g) => (
        <div key={g.label} className="sel-nav-group">
          <p className="sel-nav-group-label">{g.label}</p>
          {g.links.map((l) => (
            <Link key={l.href} href={l.href} className="sel-nav-link">
              {l.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
