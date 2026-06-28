import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://lounge-by-gigi.vercel.app"),
  title: {
    default: "Lounge by Gigi | Fashion, Swimwear & Elevated Essentials",
    template: "%s | Lounge by Gigi"
  },
  description:
    "Lounge by Gigi is an online fashion store for swimwear, essentials, resort wear and elevated everyday pieces.",
  keywords: [
    "Lounge by Gigi",
    "Lounge",
    "lounge by gigi store",
    "lounge fashion",
    "swimwear",
    "women fashion",
    "men fashion",
    "resort wear",
    "elevated essentials",
    "online clothing store"
  ],
  authors: [{ name: "Lounge by Gigi" }],
  creator: "Lounge by Gigi",
  publisher: "Lounge by Gigi",
  alternates: {
    canonical: "https://lounge-by-gigi.vercel.app"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lounge-by-gigi.vercel.app",
    siteName: "Lounge by Gigi",
    title: "Lounge by Gigi | Fashion, Swimwear & Elevated Essentials",
    description:
      "Discover Lounge by Gigi: swimwear, essentials, resort wear and elevated everyday pieces.",
    images: [
      {
        url: "https://i.postimg.cc/fbMj7BXh/IMG-0386.jpg",
        width: 1200,
        height: 630,
        alt: "Lounge by Gigi"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Lounge by Gigi | Fashion, Swimwear & Elevated Essentials",
    description:
      "Discover Lounge by Gigi: swimwear, essentials, resort wear and elevated everyday pieces.",
    images: ["https://i.postimg.cc/fbMj7BXh/IMG-0386.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: "/icon.svg"
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "Lounge by Gigi",
    alternateName: "Lounge",
    url: "https://lounge-by-gigi.vercel.app",
    logo: "https://lounge-by-gigi.vercel.app/icon.svg",
    image: "https://i.postimg.cc/fbMj7BXh/IMG-0386.jpg",
    description:
      "Lounge by Gigi is an online fashion store for swimwear, essentials, resort wear and elevated everyday pieces.",
    sameAs: [],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://lounge-by-gigi.vercel.app/shop?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <body>
        <link rel="preconnect" href="https://i.postimg.cc" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://files.cdn.printful.com" />
        <link rel="dns-prefetch" href="https://i.postimg.cc" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://files.cdn.printful.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}<SiteFooter />
      </body>
    </html>
  );
}




