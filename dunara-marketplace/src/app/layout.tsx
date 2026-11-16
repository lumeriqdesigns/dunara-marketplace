import type { Metadata, Viewport } from "next";
import { brand } from "@/config/brand";
import "./globals.css";

const getSiteUrl = () => {
  if (brand.url) {
    try {
      return new URL(brand.url);
    } catch {
      // Fallback if brand.url is malformed
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("http://localhost:3000");
};

export const metadata: Metadata = {
  title: {
    default: brand.name,
    template: `%s | ${brand.name}`
  },
  description: brand.description,
  applicationName: brand.name,
  metadataBase: getSiteUrl(),
  openGraph: {
    title: brand.name,
    description: brand.description,
    siteName: brand.name,
    type: "website",
    locale: "en_NG"
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  themeColor: "#087F50",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
