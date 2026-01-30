import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AOC Protocol — Architects of Change",
  description:
    "An open standard that enables citizens to control their data and nations to adopt interoperable sovereignty infrastructure—powering a collaborative data economy with consent at the core.",
  keywords: [
    "data sovereignty",
    "citizen data",
    "open protocol",
    "consent",
    "sovereign wallet",
    "SDL",
  ],
  authors: [{ name: "AOC Protocol" }],
  openGraph: {
    title: "AOC Protocol — Architects of Change",
    description:
      "Open rails for consent, identity, and sovereign data exchange.",
    url: "https://aocprotocol.org",
    siteName: "AOC Protocol",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
