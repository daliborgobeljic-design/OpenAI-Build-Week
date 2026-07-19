import type { Metadata } from "next";
import "./globals.css";
import "./upload.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "CRA Evidence OS",
  description: "Traceable cyber-resilience evidence for product teams.",
  openGraph: { title: "CRA Evidence OS", description: "Evidence you can trace. Changes you can explain.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
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
