import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { brand, brandAssets, metadataDefaults, colors } from "@/config/brand";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: metadataDefaults.title,
  description: metadataDefaults.description,
  metadataBase: new URL(brand.url),
  applicationName: brand.name,
  authors: [{ name: "Lumeriq Designs" }],
  openGraph: {
    ...metadataDefaults.openGraph,
    title: metadataDefaults.title.default,
    description: metadataDefaults.description,
    url: brand.url,
    images: [{ url: brandAssets.ogDefault, width: 1200, height: 630, alt: brand.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: metadataDefaults.title.default,
    description: metadataDefaults.description,
    images: [brandAssets.ogDefault],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/logo-mark.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: colors.primary.DEFAULT,
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG">
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
