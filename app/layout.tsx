import type { Metadata } from "next";
import "./globals.css";
import "./upload.css";
import "./judge-demo.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "CRA Evidence OS",
  description: "Traceable cyber-resilience evidence for product teams.",
  openGraph: { title: "CRA Evidence OS", description: "Cited AI. Human decision.", images: ["/og-build-week.png"] },
  twitter: { card: "summary_large_image", images: ["/og-build-week.png"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
