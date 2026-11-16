import Link from "next/link";

const groups: {
  label: string;
  links: { href: string; label: string; badgeKey?: "unread" }[];
}[] = [
  {
    label: "Discover",
    links: [
      { href: "/buyer/dashboard", label: "Overview" },
      { href: "/buyer/favourites", label: "Favourites" }
    ]
  },
  {
    label: "Activity",
    links: [
      { href: "/buyer/bookings", label: "Bookings" },
      { href: "/buyer/quotes", label: "Quotes" },
      { href: "/buyer/messages", label: "Messages" },
      { href: "/buyer/reviews", label: "Reviews" },
      { href: "/buyer/notifications", label: "Notifications", badgeKey: "unread" }
    ]
  },
  {
    label: "Account",
    links: [
      { href: "/buyer/profile", label: "Profile" },
      { href: "/buyer/settings", label: "Settings" }
    ]
  }
];

export function BuyerNav({ unread = 0 }: { unread?: number }) {
  return (
    <nav className="buy-nav" aria-label="Buyer dashboard">
      {groups.map((g) => (
        <div key={g.label} className="buy-nav-group">
          <p className="buy-nav-group-label">{g.label}</p>
          {g.links.map((l) => (
            <Link key={l.href} href={l.href} className="buy-nav-link">
              {l.label}
              {l.badgeKey === "unread" && unread > 0 && (
                <span className="buy-nav-badge">{unread > 9 ? "9+" : unread}</span>
              )}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
